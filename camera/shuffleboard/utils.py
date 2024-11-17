import numpy as np
import cv2

def get_limits(colour):
     c = np.uint8([[colour]])
     hsvC = cv2.cvtColor(c, cv2.COLOR_BGR2HSV)

     lowerLimit = hsvC[0][0][0] - 10, 100, 100
     upperLimit = hsvC[0][0][0] + 10, 100, 100

     lowerLimit = np.array(lowerLimit, dtype=np.uint8)
     upperLimit = np.array(upperLimit, dtype=np.uint8)

     return lowerLimit, upperLimit