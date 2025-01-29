from test_base import TestBase
from unittest.mock import patch

from shuffleboard.capture import capture_image

class TestCapture(TestBase):
    @patch('shuffleboard.capture.cam')
    def test_capture_image_success(self, mock_camera):
        test_image_data = "some-image-data"
        mock_camera.read.return_value = (True, test_image_data)

        result = capture_image()

        self.assertEqual(result, test_image_data)
        mock_camera.read.assert_called_once()

    @patch('shuffleboard.capture.cam')
    def test_capture_image_failure(self, mock_camera):
        mock_camera.read.return_value = (False, None)

        result = capture_image()

        self.assertIsNone(result)
        mock_camera.read.assert_called_once()
