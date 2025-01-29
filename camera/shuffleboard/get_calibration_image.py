import cv2
import base64

from shuffleboard.base_logger import setup_logger
from shuffleboard.capture import capture_image

logger = setup_logger(__file__)

def get_calibration_image():
    try:
        img = capture_image()
        # img = cv2.imread('capture.png', cv2.IMREAD_COLOR)
        _, buffer = cv2.imencode('.jpg', img)
        jpg_string = base64.b64encode(buffer).decode()
        return jpg_string
    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == '__main__':
    get_calibration_image()
