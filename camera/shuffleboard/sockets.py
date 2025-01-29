import socketio
import asyncio
import base64

from shuffleboard.photo import take_photo
from shuffleboard.get_calibration_image import get_calibration_image
from shuffleboard.shuffleView import get_discs

# Upper bound for updates per second (excludes processing time)
UPDATES_PER_SECOND = 30
SLEEP_DURATION = 1 / UPDATES_PER_SECOND

sio = socketio.AsyncClient()

async def send_state_periodically():
    global board_coordinates
    board_coordinates = None

    def update_calibration_coordinates(coordinates):
        global board_coordinates
        board_coordinates = coordinates
        print(f'New calibration coordinates: {coordinates}')

    try:
        await sio.connect("http://localhost:3000")

        sio.on("get-calibration-image", send_calibration_image)
        sio.on("update-calibration-coordinates", update_calibration_coordinates)

        print("Camera service connected to web service")
        while True:
            if board_coordinates is not None:
                img = take_photo()
                game_state = get_discs(img, board_coordinates)
                game_state_json = [disc.to_json() for disc in game_state]
                
                await sio.emit("send-state", game_state_json)
        
            await asyncio.sleep(SLEEP_DURATION)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await sio.disconnect()
        print("Camera service disconnected from web service")

async def send_calibration_image():
    try:
        print("Getting encoded calibration image...")
        jpg_string = get_calibration_image()
        await sio.emit("send-calibration-image", jpg_string)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(send_state_periodically())
