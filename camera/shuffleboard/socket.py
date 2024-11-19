import socketio
import asyncio
sio = socketio.AsyncClient()

async def start():
    socket = await sio.connect("http://localhost:3000")
    await sio.wait()

asyncio.run(start())
