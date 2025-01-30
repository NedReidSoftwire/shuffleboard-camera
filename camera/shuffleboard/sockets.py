import socketio
import asyncio
import base64

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

async def send_state_periodically():
    global board_coordinates
    board_coordinates = None

    def update_calibration_coordinates(coordinates):
        global board_coordinates

        # TODO: We need to add margins to these coordinates before saving them.
        #
        # Detections are designed to work when > 0.5 of the disc is visible in the image.
        # For the surface midpoint, we need a negative margin to ensure the disc has fully
        # crossed the line (since detection works with only > 0.5 of disc visible).
        # For the other three edges, we need positive margins to detect discs that are
        # partially on the edge of the surface (where only ~half the disc width is visible).
        #
        # These margins will be dependent on the shot dimensions.
        board_coordinates = coordinates

        logger.info(f'New calibration coordinates: {coordinates}')
        visualise_calibration_coordinates(coordinates)

    try:
        await sio.connect("http://localhost:3000")

        sio.on("get-calibration-image", send_calibration_image)
        sio.on("update-calibration-coordinates", update_calibration_coordinates)

        logger.info("Camera service connected to web service")

        while True:
            if board_coordinates is not None:
                img = capture_image()
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
