# https://www.smashingmagazine.com/2016/02/simple-augmented-reality-with-opencv-a-three-js/

import threading
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json

clients = []
server = None

def start():
  class SimpleWSServer(WebSocket):
      def handleConnected(self):
          clients.append(self)

      def handleClose(self):
          clients.remove(self)

  def run_server():
      global server
      server = SimpleWebSocketServer('', 9000, SimpleWSServer,
                                    selectInterval=(1000.0 / 15) / 1000)
      server.serveforever()

  t = threading.Thread(target=run_server)
  t.start()

def send(value):
  msg = json.dumps(value)
  msg = unicode(msg)
  for client in clients:
    client.sendMessage(msg)
  # print 'send ', value

def close():
  server.close()

if __name__ == "__main__":
  start()