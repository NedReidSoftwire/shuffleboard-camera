import cv2
import base64
from photo import take_photo


def get_calibration_image():
    try:
        img = take_photo()
        # img = cv2.imread('capture.png', cv2.IMREAD_COLOR)
        _, buffer = cv2.imencode('.jpg', img)
        jpg_string = base64.b64encode(buffer).decode()
        return jpg_string
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    get_calibration_image()
