#!/usr/bin/env python
import asyncio
import datetime
import random
import time
import websockets
import bluetooth
import sys

bluetooth_id = sys.argv[1]
sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
sock.connect((bluetooth_id, 1))
print("connected")

async def operation_handler(websocket, path):
    async for message in websocket:
        print("operation:",message)
        sock.send(message+",")

async def sensor_handler(websocket, path):
    while True:
        data = ""
        string = ""
        pos = -1
        while True:
            data = sock.recv(4096).decode()
            pos = data.find('$')
            if pos == -1: 
                break
            string += data
        string += data[0:pos]
        print("string:",string)
        sensordata = string.split(',')
        if len(sensordata) > 5 and sensordata[2] == "l":
            print("distance:",sensordata[1])
            print("left:",sensordata[3])
            print("right:",sensordata[5])
            await websocket.send(sensordata[1]+","+sensordata[3]+","+sensordata[5])
        await asyncio.sleep(0.1)

async def handler(websocket, path):
    consumer_task = asyncio.ensure_future(
        operation_handler(websocket, path))
    producer_task = asyncio.ensure_future(
        sensor_handler(websocket, path))
    done, pending = await asyncio.wait(
        [consumer_task, producer_task],
        return_when=asyncio.FIRST_COMPLETED,
    )
    for task in pending:
        task.cancel()

start_server = websockets.serve(handler, '127.0.0.1', 8000)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()