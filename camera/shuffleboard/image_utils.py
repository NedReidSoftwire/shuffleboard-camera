import cv2

def get_binary_thresholded_img(img_hsv):
    if len(img_hsv.shape) != 3 or img_hsv.shape[2] != 3:
        raise ValueError("Input image must be in HSV format with 3 bands.")

    img_greyscale = cv2.split(img_hsv)[2]
    _, img_thresholded = cv2.threshold(img_greyscale, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    return img_thresholded
