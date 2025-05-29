import time
import traceback
import cv2

from shuffleboard.base_logger import setup_logger

logger = setup_logger(__file__)

current_port = 0
cam = cv2.VideoCapture(0)


def capture_image(camera_port):
    global current_port, cam

    if camera_port != current_port:
        current_port = camera_port
        cam.release()
        cam = cv2.VideoCapture(camera_port)
        # Camera needs time to start up
        time.sleep(1)

    result, image = cam.read()
    if result:
        return image 

if __name__ == '__main__':
    capture = capture_image(0)
    cv2.imwrite('capture.png', capture)
