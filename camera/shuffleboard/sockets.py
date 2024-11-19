import socketio
import asyncio
from photo import take_photo
from shuffleView import get_discs

sio = socketio.AsyncClient()

async def send_state_periodically():
    try:
        await sio.connect("http://localhost:3000")
        print("Connected to server")
        while True:
            img = take_photo()
            game_state = get_discs(img)
            game_state_json = [disc.to_json() for disc in game_state]
            
            await sio.emit("send-state", game_state_json)
        
            await asyncio.sleep(0.02)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await sio.disconnect()
        print("Disconnected from server")

if __name__ == "__main__":
    asyncio.run(send_state_periodically())
