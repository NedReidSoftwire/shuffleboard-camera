import cv2

from shuffleboard.capture import capture_image

def visualise_calibration_coordinates(coordinates):
    if len(coordinates) != 4:
        raise ValueError("Coordinates must be a list of 4 tuples.")

    img = capture_image()

    for x, y in coordinates:
        cv2.circle(img, (int(x), int(y)), 5, (0, 255, 0), 2)

    cv2.imwrite('debug_calibrated_coordinates.jpg', img)