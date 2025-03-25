import socketio
import asyncio
import base64

import yaml

from shuffleboard.base_logger import setup_logger
from shuffleboard.capture import capture_image
from shuffleboard.get_calibration_image import get_calibration_image
from shuffleboard.get_disc_positions import get_discs
from shuffleboard.visualise_calibration_coordinates import visualise_calibration_coordinates

logger = setup_logger(__file__)

# Upper bound for updates per second (excludes processing time)
UPDATES_PER_SECOND = 30
SLEEP_DURATION = 1 / UPDATES_PER_SECOND

sio = socketio.AsyncClient()

open('config.yaml', 'a').close()
config_file = open('config.yaml', 'r')
config_yaml = yaml.safe_load(config_file)
if config_yaml is None:
    config_yaml = {}
config_file.close()


async def send_state_periodically():
    global board_coordinates, camera_port
    if config_yaml.get('board_coordinates'):
        board_coordinates = config_yaml.get('board_coordinates')
    else:
        board_coordinates = None

    if config_yaml.get('camera_port'):
        camera_port = config_yaml.get('camera_port')
    else:
        camera_port = 0

    def update_calibration_coordinates(coordinates):
        global board_coordinates
        board_coordinates = coordinates
        config_file = open('config.yaml', 'w')
        config_yaml['board_coordinates'] = board_coordinates
        yaml.dump(config_yaml, config_file)
        config_file.close()

        logger.info(f'New calibration coordinates: {coordinates}')
        visualise_calibration_coordinates(coordinates)

    try:
        await sio.connect("http://localhost:3000")

        sio.on("get-calibration-image", send_calibration_image)
        sio.on("update-calibration-coordinates", update_calibration_coordinates)

        logger.info("Camera service connected to web service")

        while True:
            if board_coordinates is not None:
                img = capture_image(camera_port)
                game_state = get_discs(img, board_coordinates)
                game_state_json = [disc.to_json() for disc in game_state]
                
                await sio.emit("send-state", game_state_json)
        
            await asyncio.sleep(SLEEP_DURATION)
    except Exception as e:
        logger.error(f"An error occurred: {e}")
    finally:
        await sio.disconnect()
        logger.info("Camera service disconnected from web service")

async def send_calibration_image():
    try:
        logger.info("Getting encoded calibration image...")
        jpg_string = get_calibration_image()

        await sio.emit("send-calibration-image", jpg_string)
    except Exception as e:
        logger.error(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(send_state_periodically())
