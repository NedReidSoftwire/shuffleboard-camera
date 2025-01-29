import unittest
from unittest.mock import patch

from shuffleboard.photo import take_photo

class TestPhoto(unittest.TestCase):
    @patch('shuffleboard.photo.cam')
    def test_take_photo_success(self, mock_camera):
        test_image_data = "some-image-data"
        mock_camera.read.return_value = (True, test_image_data)

        result = take_photo()

        self.assertEqual(result, test_image_data)
        mock_camera.read.assert_called_once()

    @patch('shuffleboard.photo.cam')
    def test_take_photo_failure(self, mock_camera):
        mock_camera.read.return_value = (False, None)

        result = take_photo()

        self.assertIsNone(result)
        mock_camera.read.assert_called_once()
