# Inspired by https://www.smashingmagazine.com/2016/02/simple-augmented-reality-with-opencv-a-three-js/

from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
import json
import detector
import traceback
import threading
import cv2
import time

# global state
server = None
clients = []
config = {
  'camera': 0,
  'display': False,
  'framesDelay': 1,
  'zone': {
    'minX': 0,
    'maxX': 1,
    'y': 0.5,
    'height': 10,
  },
  'active': True,
}

"""
Basic websocket handler. Does nothing itself, apart from parsing the messages
and keeping track of the clients. Sends parsed messages to the receive function
"""
class DetectorHandler(WebSocket):
  def handleMessage(self):
    try:
      receive(json.loads(self.data))
    except Exception as e:
      traceback.print_stack()
      print e
  def handleConnected(self):
    clients.append(self)
  def handleClose(self):
     clients.remove(self)

"""
Handle incoming messages: config updates, etc...
"""
def receive(data):
  action = data["action"]
  payload = data["payload"]
  if (action == 'updateConfig'):
    # Generic config dict
    for key in payload:
      config[key] = payload[key]
    # Update clients with new config
    send({'type': 'config', 'value': config})
  else:
    print "unexpected action:", action

"""
Send data to all clients
"""
def send(data):
  msg = unicode(json.dumps(data))
  for client in clients:
    client.sendMessage(msg)

"""
Method used to run the socket server inside a thread, allowing the openCV loop to
be uninterrupted
"""
def run_server():
  global server
  server = SimpleWebSocketServer('', 9000, DetectorHandler, selectInterval=(1000.0 / 15) / 1000)
  server.serveforever()

# Start the socket server thread
detector.init()
socket_thread = threading.Thread(target=run_server)
socket_thread.daemon = True
socket_thread.start()

# OpenCV loop
while True:
  try:
    if config['active']:
      value, display = detector.detect(config)
      if value:
        send({'type': 'detectorValue', 'value': value })
      if display:
        send({'type': 'detectorDisplay', 'value': display })
    time.sleep(config['framesDelay'] / 1000.0)
  except KeyboardInterrupt:
    detector.stop()
    break

detector.stop()
