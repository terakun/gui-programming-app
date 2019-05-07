#!/usr/bin/env python

# ハードウェア側のシミュレータ
import asyncio
import websockets
import bluetooth

async def echo(websocket, path):
    async for message in websocket:
        print(message)
        sensordata = 100
        print(sensordata)
        await websocket.send(str(sensordata))

asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, '127.0.0.1', 8000))
asyncio.get_event_loop().run_forever()