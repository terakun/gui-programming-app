#!/usr/bin/env python
import asyncio
import websockets
import bluetooth

sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
sock.connect(("id", 1))

async def echo(websocket, path):
    async for message in websocket:
        print(message)
        sock.send(message)
        sensordata = sock.recv(4096).decode().split(' ')

        print(sensordata)
        await websocket.send(str(sensordata[-2]))

asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, '127.0.0.1', 8000))
asyncio.get_event_loop().run_forever()