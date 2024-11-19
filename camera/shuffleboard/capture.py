import cv2

cam_port = 0
cam = cv2.VideoCapture(cam_port) 

result, image = cam.read() 

if result: 
  cv2.imwrite('capture.png', image) 
else: 
  print('Failed to read from camera')
