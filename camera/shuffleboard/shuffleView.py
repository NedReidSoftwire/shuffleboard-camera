import cv2
import numpy as np
from utils import get_limits
from dataclasses import dataclass
from enum import Enum

class DiscColour(Enum):
  RED = 1
  BLUE = 2

@dataclass
class Disc:
  x: int
  y: int
  colour: DiscColour

surface_size = (400, 1200)
board_corners = np.array([[412, 698], [434, 321], [1575, 293], [1623, 627]], dtype=np.float32) # BL, TL, TR, BR

def __get_transformed_image(img, corners):
    new_corners = np.array([[0, 0], [surface_size[0], 0], surface_size, [0, surface_size[1]]], dtype=np.float32)

    T = cv2.getPerspectiveTransform(corners, new_corners)
    pers_image = cv2.warpPerspective(img, T, surface_size)

    return pers_image

def __get_discs(img, colour):
    if colour == DiscColour.RED:
        detections = __get_red_objects(img)
        cv2.imwrite('red.png', detections)
    elif colour == DiscColour.BLUE:
        detections = __get_blue_objects(img)
        cv2.imwrite('blue.png', detections)
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
            cv2.circle(debug_img, center, radius, (0, 255, 0), 2)
            cv2.circle(debug_img, center, 8, (0, 255, 0), -1)
        
        cv2.imwrite('debug_detections.png', debug_img)

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
    transformed_image = __get_transformed_image(img, board_corners)
    cv2.imwrite('transformed_image.png', transformed_image)

    red_discs = __get_discs(transformed_image, DiscColour.RED)
    blue_discs = __get_discs(transformed_image, DiscColour.BLUE)

    all_discs = red_discs + blue_discs
    print('all_discs', all_discs)

    return all_discs

if __name__ == '__main__':
    img = cv2.imread('capture.png')

    coords = get_disc_coordinates(img)
