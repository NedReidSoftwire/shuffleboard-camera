import socketio
import asyncio
from photo import take_photo
from get_calibration_image import get_calibration_image
from shuffleView import get_discs
import base64

sio = socketio.AsyncClient()
board_coordinates = [[320, 569], [335, 170], [1520, 140], [1554, 539]]

async def send_state_periodically():
    global board_coordinates
    try:
        def update_calibration_coordinates(coordinates):
            global board_coordinates
            board_coordinates = coordinates
            print(coordinates)
        await sio.connect("http://localhost:3000")
        sio.on("get-calibration-image", send_calibration_image)
        sio.on("update-calibration-coordinates", update_calibration_coordinates)

        print("Connected to server")
        while True:
            img = take_photo()
            game_state = get_discs(img, board_coordinates)
            game_state_json = [disc.to_json() for disc in game_state]
            
            await sio.emit("send-state", game_state_json)
        
            await asyncio.sleep(0.03)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await sio.disconnect()
        print("Disconnected from server")


async def send_calibration_image():
    try:
        print("getting calibration image")
        jpg_string = get_calibration_image()
        await sio.emit("send-calibration-image", jpg_string)
    except Exception as e:
        print(f"An error occurred: {e}")




if __name__ == "__main__":
    asyncio.run(send_state_periodically())
