import server
import detector
import cv2

server.start()
detector.init()

while(True):
  try:
    value = detector.detect()
    if value != None:
      server.send(value)

    # watch for exit key
    if cv2.waitKey(1) & 0xFF == ord('q'):
      break
  except KeyboardInterrupt:
    cv2.destroyAllWindows()
    break

detector.stop()
server.close()