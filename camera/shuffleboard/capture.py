import cv2

from shuffleboard.base_logger import setup_logger

logger = setup_logger(__file__)

CAMERA_PORT = 0

cam = cv2.VideoCapture(CAMERA_PORT) 

def capture_image(): 
    result, image = cam.read()
    if result: 
        return image 

    logger.warning('Failed to read from camera')

if __name__ == '__main__':
    capture = capture_image()
    cv2.imwrite('capture.png', capture)
