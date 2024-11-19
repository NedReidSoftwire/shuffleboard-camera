import socketio
import asyncio
from photo import takePhoto
from shuffleView import get_disc_coordinates
from dataclasses import dataclass
from dataclasses_json import dataclass_json

sio = socketio.AsyncClient()

async def send_state_periodically():
    try:
        await sio.connect("http://localhost:3000")
        print("Connected to server")
        while True:
            img = takePhoto()
            gameState = get_disc_coordinates(img)
            gameStateJson = [disc.to_json() for disc in gameState]
            await sio.emit("send-state", gameStateJson)
            print("Game state sent")
            await asyncio.sleep(5)  # Wait for 5 seconds before sending again
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await sio.disconnect()
        print("Disconnected from server")

if __name__ == "__main__":
    asyncio.run(send_state_periodically())


