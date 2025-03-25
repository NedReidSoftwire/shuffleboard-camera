import cv2

from shuffleboard.capture import capture_image

def visualise_calibration_coordinates(coordinates, camera_port):
    if len(coordinates) != 4:
        raise ValueError("Coordinates must be a list of 4 tuples.")

    img = capture_image(camera_port)

    pts = [(int(x), int(y)) for x, y in coordinates]

    for i in range(4):
        cv2.circle(img, (int(pts[i][0]), int(pts[i][1])), 5, (0, 255, 0), 4)
        cv2.line(img, pts[i], pts[(i + 1) % 4], (0, 255, 0), 2)

    cv2.imwrite('debug_calibrated_coordinates.jpg', img)
