import cv2
import numpy as np
from utils import get_limits
from dataclasses import dataclass
from enum import Enum
from dataclasses import dataclass
from dataclasses_json import dataclass_json

@dataclass_json
@dataclass
class DiscColour(Enum):
  RED = 'Red'
  BLUE = 'Blue'

@dataclass_json
@dataclass
class Disc:
  x: int
  y: int
  colour: DiscColour

surface_size = (400, 1200)
board_corners = np.array([[389, 677], [401, 286], [1556, 241], [1607, 627]], dtype=np.float32) # BL, TL, TR, BR

def __get_transformed_image(img, corners):
    new_corners = np.array([[0, 0], [surface_size[0], 0], surface_size, [0, surface_size[1]]], dtype=np.float32)

    T = cv2.getPerspectiveTransform(corners, new_corners)
    pers_image = cv2.warpPerspective(img, T, surface_size)

    return pers_image

def __get_discs(img, colour):
    if colour == DiscColour.RED:
        detections = __get_red_objects(img)
        colour_rgb = (0, 0, 255)
    elif colour == DiscColour.BLUE:
        detections = __get_blue_objects(img)
        colour_rgb = (255, 0, 0)
    else:
        raise Exception("Unsupported disc colour.")

    blurred = cv2.GaussianBlur(detections, (9, 9), 2)
    edges = cv2.Canny(blurred, 50, 150)

    # cv2.imwrite('gray.png', gray)
    cv2.imwrite('blurred.png', blurred)

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

    if circles is not None:
        debug_img = img.copy()
        circles = np.uint16(np.around(circles))

        discs = []
        for x, y, radius in circles[0, :]:
            discs.append(Disc(x=x.item(), y=y.item(), colour=colour))

            center = (x, y)
            cv2.circle(debug_img, center, radius, colour_rgb, 2)
            cv2.circle(debug_img, center, 8, colour_rgb, -1)
        
        cv2.imwrite(f'debug_detections_{colour.value}.png', debug_img)

        return discs
    else:
        raise Exception("No circles detected in the image")

def __get_red_objects(img):
    hsvImage = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # colour map: https://i.sstatic.net/gyuw4.png
    redLower = np.array([160, 150, 20])
    redUpper = np.array([180, 255, 255])
    redLower2 = np.array([0, 150, 20])
    redUpper2 = np.array([20, 255, 255])

    redMask1 = cv2.inRange(hsvImage, redLower, redUpper)
    redMask2 = cv2.inRange(hsvImage, redLower2, redUpper2)
    redMask = cv2.bitwise_or(redMask1, redMask2)
    red_objects = cv2.bitwise_and(img, img, mask=redMask)

    return __get_binary_thresholded_img(red_objects)

def __get_blue_objects(img):
    hsvImage = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    blueLower = np.array([100, 140, 5])
    blueUpper = np.array([130, 255, 255])

    print(blueLower, blueUpper)

    blueMask = cv2.inRange(hsvImage, blueLower, blueUpper)
    blue_objects = cv2.bitwise_and(img, img, mask=blueMask)

    return __get_binary_thresholded_img(blue_objects)

def __get_binary_thresholded_img(img_hsv):
    greyscale = cv2.split(img_hsv)[2]
    _, detections = cv2.threshold(greyscale, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    return detections

def get_disc_coordinates(img):
    try:
        transformed_image = __get_transformed_image(img, board_corners)
        cv2.imwrite('transformed_image.png', transformed_image)

        red_discs = __get_discs(transformed_image, DiscColour.RED)
        blue_discs = __get_discs(transformed_image, DiscColour.BLUE)

        print(len(red_discs), 'red', len(blue_discs), 'blue')

        all_discs = red_discs + blue_discs
        print('all_discs', all_discs)

        return all_discs
    except Exception as e:
        print('Error', e)
        return []

if __name__ == '__main__':
    img = cv2.imread('capture.png')

    coords = get_disc_coordinates(img)
