import cv2

CAMERA_PORT = 0

cam = cv2.VideoCapture(CAMERA_PORT) 

def take_photo(): 
    result, image = cam.read()
    if result: 
        return image 

    print('Failed to read from camera')

if __name__ == '__main__':
    capture = take_photo()
    cv2.imwrite('capture.png', capture)
