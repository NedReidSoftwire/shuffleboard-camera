import cv2
import numpy as np
from utils import get_limits

img = cv2.imread('test_image_1.jpg')

blue = [147, 49, 33]
redLower = np.array([160, 150, 20])
redUpper = np.array([180, 255, 255])
redLower2 = np.array([0, 150, 20])
redUpper2 = np.array([20, 255, 255])



corners = np.array([[55, 38], [191, 28], [465, 738], [1086, 467]], dtype=np.float32)
newCorners = np.array([[0, 0], [500, 0], [0, 1000] ,[500, 1000]], dtype=np.float32)


T = cv2.getPerspectiveTransform(corners, newCorners)
persImage = cv2.warpPerspective(img, T, (500, 1000))

hsvImage = cv2.cvtColor(persImage, cv2.COLOR_BGR2HSV)

blueLower, blueUpper = get_limits(blue)

redMask1 = cv2.inRange(hsvImage, redLower, redUpper)
redMask2 = cv2.inRange(hsvImage, redLower2, redUpper2)
redMask = cv2.bitwise_or(redMask1, redMask2)
redCounters = cv2.bitwise_and(persImage, persImage, mask=redMask)

countours, hierachy = cv2.findContours(redMask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

if len(countours) > 0:
    for countour in countours:
        if cv2.contourArea(countour) > 100:
            x, y, w, h = cv2.boundingRect(countour)
            cv2.rectangle(persImage, (x, y), (x+w, y+h), (0, 255, 0), 2)

invRedMask = cv2.bitwise_not(redMask)
countours, hierachy = cv2.findContours(invRedMask, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
if len(countours) > 0:
    for countour in countours:
        if cv2.contourArea(countour) > 20 and cv2.contourArea(countour) < 120:
            x, y, w, h = cv2.boundingRect(countour)
            cv2.circle(persImage, (int(x + w/2), int(y + h/2)), int(h/2), (255, 0, 0), 5)


finalIm = cv2.cvtColor(hsvImage, cv2.COLOR_HSV2BGR)

cv2.imshow("board", persImage)

cv2.waitKey(0)
cv2.destroyAllWindows()

