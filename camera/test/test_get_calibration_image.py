from test_base import TestBase
from unittest.mock import patch
import numpy as np
import cv2
import base64

from shuffleboard.get_calibration_image import get_calibration_image

class TestGetCalibrationImage(TestBase):
    def setUp(self):
        self.test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        # Add some test pattern to make it unique
        self.test_image[30:70, 30:70] = 255

    @patch('shuffleboard.get_calibration_image.capture_image')
    def test_successful_image_capture(self, mock_capture_image):
        # Arrange
        mock_capture_image.return_value = self.test_image

        # Act
        result = get_calibration_image()

        # Assert
        self.assertIsInstance(result, str)

        decoded_bytes = base64.b64decode(result)
        np_arr = np.frombuffer(decoded_bytes, np.uint8)
        decoded_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Tolerance accounts for minor differences due to JPEG compression.
        self.assertTrue(np.allclose(decoded_image, self.test_image, atol=5), "Decoded image does not match test image within tolerance")

    @patch('shuffleboard.get_calibration_image.capture_image')
    def test_handle_photo_error(self, mock_capture_image):
        # Arrange
        mock_capture_image.side_effect = Exception("Camera error")

        # Act
        result = get_calibration_image()

        # Assert
        self.assertIsNone(result)
