import cv2
from typing import List

def list_ports(max_test_port: int = 10) -> List[int]:
    """Return a list of camera indices that can be opened with OpenCV.

    Args:
        max_test_port: Highest port (exclusive) to probe starting from 0.

    Returns:
        Sorted list of integer port indices that responded successfully.
    """
    available: List[int] = []
    for port in range(max_test_port):
        cap = cv2.VideoCapture(port, cv2.CAP_MSMF)
        if cap.isOpened():
            available.append(port)
            cap.release()
        else:
            # Ensure the capture object is released even if not opened
            cap.release()
    # Remove duplicates just in case and sort
    return sorted(set(available))


if __name__ == "__main__":
    print("Detected camera ports:", list_ports())