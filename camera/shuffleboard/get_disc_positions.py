import cv2
import numpy as np
from enum import Enum
from dataclasses import dataclass
from dataclasses_json import dataclass_json

from shuffleboard.base_logger import setup_logger
from shuffleboard.capture import capture_image
from shuffleboard.get_colour_masks import get_red_mask, get_blue_mask
from shuffleboard.image_utils import get_binary_thresholded_img

logger = setup_logger(__file__)

DEBUG = False

class DiscColour(Enum):
  RED = 'Red'
  BLUE = 'Blue'

@dataclass_json
@dataclass
class Disc:
  x: int
  y: int
  colour: DiscColour

surface_dimensions = (400, 1200)
new_corners = np.array([[0, 0], [surface_dimensions[0], 0], surface_dimensions, [0, surface_dimensions[1]]], dtype=np.float32)

def __transform_image_to_top_down_view(img, corners):
    T = cv2.getPerspectiveTransform(corners, new_corners)
    transformed_img = cv2.warpPerspective(img, T, surface_dimensions)

    return transformed_img

def get_circles(binary_detections_img, colour):
    blurred = cv2.GaussianBlur(binary_detections_img, (9, 9), 2)
    if DEBUG:
        cv2.imwrite(f'debug_blurred_{colour.value}.png', blurred)

    edges = cv2.Canny(blurred, 50, 150)

    # https://docs.opencv.org/3.4/dd/d1a/group__imgproc__feature.html#ga47849c3be0d0406ad3ca45db65a25d2d
    circles = cv2.HoughCircles(
        edges,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=20,
        param1=50,
        param2=20,
        minRadius=10,
        maxRadius=35
    )

    if circles is None:
        return []

    return np.uint16(np.around(circles))

def __get_discs_by_colour(img_bgr, colour):
    assert len(img_bgr.shape) == 3, "Provided image must have 3 bands."

    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    if colour == DiscColour.RED:
        detections_img = __get_objects_by_colour(img_hsv, colour)
        colour_rgb = (0, 0, 255)
    elif colour == DiscColour.BLUE:
        detections_img = __get_objects_by_colour(img_hsv, colour)
        colour_rgb = (255, 0, 0)
    else:
        raise Exception("Unsupported disc colour.")

    circles = get_circles(detections_img, colour)

    if DEBUG:
        debug_img = img_bgr.copy()

    discs = []
    for x, y, radius in circles[0, :]:
        # NOTE: Due to the camera's position, the y-axis is to the midpoint of
        # the shuffleboard surface, we want the y-coordinates to begin at the 
        # end of the table.
        flipped_y = surface_dimensions[1] - y.item()

        discs.append(Disc(x=x.item(), y=flipped_y, colour=colour))

        if DEBUG:
            center = (x, y)
            cv2.circle(debug_img, center, radius, colour_rgb, 5)
            cv2.circle(debug_img, center, 8, colour_rgb, -1)
    
    if DEBUG:
        cv2.imwrite(f'debug_detections_{colour.value}.png', debug_img)

    return discs

def __get_objects_by_colour(img_hsv, colour):
    if colour == DiscColour.RED:
        mask = get_red_mask(img_hsv)
    elif colour == DiscColour.BLUE:
        mask = get_blue_mask(img_hsv)
    else:
        raise Exception("Unsupported disc colour.")
    
    objects = cv2.bitwise_and(img_hsv, img_hsv, mask=mask)

    return get_binary_thresholded_img(objects)

def get_discs(img, board_coordinates):
    board_corners = np.array(board_coordinates, dtype = np.float32) # BL, TL, TR, BR

    try:
        img_transformed = __transform_image_to_top_down_view(img, board_corners)

        red_discs = __get_discs_by_colour(img_transformed, DiscColour.RED)
        blue_discs = __get_discs_by_colour(img_transformed, DiscColour.BLUE)

        all_discs = red_discs + blue_discs

        if DEBUG:
            cv2.imwrite('debug_transformed_image.png', img_transformed)
            logger.info(f'Disc detections: {len(red_discs)} red, {len(blue_discs)} blue')
            logger.info(f'All disc coordinates: {all_discs}')

        return all_discs
    except Exception as e:
        logger.error(f"An error occurred while getting the discs: {e}")
        return []

if __name__ == '__main__':
    img = capture_image()

    coords = get_discs(img)
    logger.info(f'Disc coordinates: {coords}')
