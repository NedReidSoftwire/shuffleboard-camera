import cv2

cam_port = 0
cam = cv2.VideoCapture(cam_port) 

def takePhoto(): 
    result, image = cam.read()
    if result: 
        # cv2.imwrite('capture.png', image)
        return image 
    else: 
        print('Failed to read from camera')

takePhoto()