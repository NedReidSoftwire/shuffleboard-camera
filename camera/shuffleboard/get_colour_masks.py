import cv2
import numpy as np

def get_red_mask(img_hsv):
    # Note that red is split across the 0-180 degree range so we need to check two ranges.
    # colour map: https://i.sstatic.net/gyuw4.png
    red_lower_1 = np.array([130, 30, 5])
    red_upper_1 = np.array([180, 255, 255])
    red_mask_1 = cv2.inRange(img_hsv, red_lower_1, red_upper_1)

    red_lower_2 = np.array([0, 30, 5])
    red_upper_2 = np.array([50, 255, 255])
    red_mask_2 = cv2.inRange(img_hsv, red_lower_2, red_upper_2)

    red_mask_combined = cv2.bitwise_or(red_mask_1, red_mask_2)

    return red_mask_combined

def get_blue_mask(img_hsv):
    blue_lower = np.array([100, 100, 5])
    blue_upper = np.array([130, 255, 255])
    blue_mask = cv2.inRange(img_hsv, blue_lower, blue_upper)

    return blue_mask
