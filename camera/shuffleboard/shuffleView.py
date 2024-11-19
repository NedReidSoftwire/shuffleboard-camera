import cv2
import numpy as np
from utils import get_limits
from dataclasses import dataclass
from enum import Enum
from dataclasses import dataclass
from dataclasses_json import dataclass_json

DEBUG = True

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
board_corners = np.array([[389, 677], [401, 286], [1556, 241], [1607, 627]], dtype=np.float32) # BL, TL, TR, BR

def __get_transformed_image(img, corners):
    new_corners = np.array([[0, 0], [surface_dimensions[0], 0], surface_dimensions, [0, surface_dimensions[1]]], dtype=np.float32)

    T = cv2.getPerspectiveTransform(corners, new_corners)
    transformed_img = cv2.warpPerspective(img, T, surface_dimensions)

    return transformed_img

def __get_discs_by_colour(img_hsv, colour):
    assert len(img_hsv.shape) == 3 and img_hsv.shape[2] == 3, "Provided image must have 3 bands."

    if colour == DiscColour.RED:
        detections = __get_red_objects(img_hsv)
        colour_rgb = (0, 0, 255)
    elif colour == DiscColour.BLUE:
        detections = __get_blue_objects(img_hsv)
        colour_rgb = (255, 0, 0)
    else:
        raise Exception("Unsupported disc colour.")

    blurred = cv2.GaussianBlur(detections, (9, 9), 2)
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

    if DEBUG:
        debug_img = img_hsv.copy()

    circles = np.uint16(np.around(circles))

    discs = []
    for x, y, radius in circles[0, :]:
        # NOTE: Due to the camera's position, the y-axis is to the center of the surface,
        # we want the y-coordinates to begin at the end of the table.
        flipped_y = surface_dimensions[1] - y.item()

        discs.append(Disc(x=x.item(), y=flipped_y, colour=colour))

        if DEBUG:
            center = (x, y)
            cv2.circle(debug_img, center, radius, colour_rgb, 4)
            cv2.circle(debug_img, center, 8, colour_rgb, -1)
    
    if DEBUG:
        cv2.imwrite(f'debug_detections_{colour.value}.png', debug_img)

    return discs

def __get_red_objects(img_hsv):
    # Note that red is split across the 0-180 degree range so we need to check two ranges.
    # colour map: https://i.sstatic.net/gyuw4.png
    red_lower_1 = np.array([160, 150, 20])
    red_upper_1 = np.array([180, 255, 255])
    red_mask_1 = cv2.inRange(img_hsv, red_lower_1, red_upper_1)

    red_lower_2 = np.array([0, 150, 20])
    red_upper_2 = np.array([20, 255, 255])
    red_mask_2 = cv2.inRange(img_hsv, red_lower_2, red_upper_2)

    red_mask_combined = cv2.bitwise_or(red_mask_1, red_mask_2)
    red_objects = cv2.bitwise_and(img_hsv, img_hsv, mask=red_mask_combined)

    return __get_binary_thresholded_img(red_objects)

def __get_blue_objects(img_hsv):
    blue_lower = np.array([100, 140, 5])
    blue_upper = np.array([130, 255, 255])
    blue_mask = cv2.inRange(img_hsv, blue_lower, blue_upper)

    blue_objects = cv2.bitwise_and(img_hsv, img_hsv, mask=blue_mask)

    return __get_binary_thresholded_img(blue_objects)

def __get_binary_thresholded_img(img_hsv):
    img_greyscale = cv2.split(img_hsv)[2]
    _, img_thresholded = cv2.threshold(img_greyscale, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    return img_thresholded

def get_discs(img):
    try:
        img_transformed = __get_transformed_image(img, board_corners)

        img_transformed_hsv = cv2.cvtColor(img_transformed, cv2.COLOR_BGR2HSV)

        red_discs = __get_discs_by_colour(img_transformed_hsv, DiscColour.RED)
        blue_discs = __get_discs_by_colour(img_transformed_hsv, DiscColour.BLUE)

        all_discs = red_discs + blue_discs

        if DEBUG:
            cv2.imwrite('debug_transformed_image.png', img_transformed)
            print('Disc detections:', len(red_discs), 'red', len(blue_discs), 'blue')
            print('all_discs:', all_discs)

        return all_discs
    except Exception as e:
        print(f"An error occurred while getting the discs: {e}")
        return []

if __name__ == '__main__':
    img = cv2.imread('capture.png')

    coords = get_discs(img)
    print('coords:', coords)
