import cv2
import numpy as np
from utils import get_limits

img = cv2.imread('capture.png')

surface_size = (382, 1622)

corners = np.array([[0, 704], [0, 327], [1623, 627], [1575, 293]], dtype=np.float32)
newCorners = np.array([[0, 0], [surface_size[0], 0], [0, surface_size[1]], surface_size], dtype=np.float32)

T = cv2.getPerspectiveTransform(corners, newCorners)
persImage = cv2.warpPerspective(img, T, surface_size)

gray = cv2.cvtColor(persImage, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (9, 9), 2)
edges = cv2.Canny(blurred, 50, 150)

cv2.imwrite('gray.png', gray)
cv2.imwrite('blurred.png', blurred)

# https://docs.opencv.org/3.4/dd/d1a/group__imgproc__feature.html#ga47849c3be0d0406ad3ca45db65a25d2d
circles = cv2.HoughCircles(
    edges,
    cv2.HOUGH_GRADIENT,
    dp=1,
    minDist=20,
    param1=50,
    param2=20,
    minRadius=15,
    maxRadius=35
)

if circles is not None:
    circles = np.uint16(np.around(circles))
    for x, y, radius in circles[0, :]:
        center = (x, y)
        print(radius)
        cv2.circle(persImage, center, radius, (0, 255, 0), 2)
        cv2.circle(persImage, center, 8, (0, 255, 0), -1)
else:
    raise Exception("No circles detected in the image")

# countours, hierachy = cv2.findContours(redMask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# if len(countours) > 0:
#     for countour in countours:
#         # if cv2.contourArea(countour) > 100:
#         x, y, w, h = cv2.boundingRect(countour)
#         cv2.rectangle(persImage, (x, y), (x+w, y+h), (0, 255, 0), 2)

# invRedMask = cv2.bitwise_not(redMask)
# countours, hierachy = cv2.findContours(invRedMask, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
# if len(countours) > 0:
#     for countour in countours:
#         # if cv2.contourArea(countour) > 20 and cv2.contourArea(countour) < 120:
#         x, y, w, h = cv2.boundingRect(countour)
#         cv2.circle(persImage, (int(x + w/2), int(y + h/2)), int(h/2), (255, 0, 0), 5)


# finalIm = cv2.cvtColor(hsvImage, cv2.COLOR_HSV2BGR)

cv2.imshow("board", persImage)

cv2.imwrite('processed.png', persImage)

cv2.waitKey(0)
cv2.destroyAllWindows()
