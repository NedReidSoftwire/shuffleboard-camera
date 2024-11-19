import cv2
import numpy as np
from utils import get_limits

surface_size = (400, 1200)
board_corners = np.array([[412, 698], [434, 321], [1575, 293], [1623, 627]], dtype=np.float32) # BL, TL, TR, BR

def get_transformed_image(corners):
    new_corners = np.array([[0, 0], [surface_size[0], 0], surface_size, [0, surface_size[1]]], dtype=np.float32)

    T = cv2.getPerspectiveTransform(corners, new_corners)
    pers_image = cv2.warpPerspective(img, T, surface_size)

    return pers_image

def get_disc_pixel_coordinates(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)
    edges = cv2.Canny(blurred, 50, 150)

    # cv2.imwrite('gray.png', gray)
    # cv2.imwrite('blurred.png', blurred)

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

        coordinates = [] # TODO: NP array and transform op?

        for x, y, radius in circles[0, :]:
            coordinates.append((x.item(), y.item()))

            center = (x, y)
            cv2.circle(debug_img, center, radius, (0, 255, 0), 2)
            cv2.circle(debug_img, center, 8, (0, 255, 0), -1)
        
        cv2.imwrite('debug_detections.png', debug_img)

        return coordinates
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

def get_disc_coordinates(img):
    transformed_image = get_transformed_image(board_corners)
    cv2.imwrite('transformed_image.png', transformed_image)

    coordinates = get_disc_pixel_coordinates(transformed_image)
    print('coordinates', coordinates)

    return coordinates

if __name__ == '__main__':
    img = cv2.imread('capture.png')

    coords = get_disc_coordinates(img)