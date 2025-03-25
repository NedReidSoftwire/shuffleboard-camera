import cv2

from shuffleboard.base_logger import setup_logger

logger = setup_logger(__file__)

def capture_image(camera_port):
    cam = cv2.VideoCapture(camera_port)

    result, image = cam.read()
    if result: 
        return image 

    logger.warning('Failed to read from camera')

if __name__ == '__main__':
    capture = capture_image()
    cv2.imwrite('capture.png', capture)
