import numpy as np
import cv2
from scipy.signal import find_peaks
import base64
import math

cap = None

def detect(config):
  ret, frame = cap.read()
  if (frame is None):
    # loop if cap is a video
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    return None, None

  # extract frame height
  height, width, _ = frame.shape

  # Discard some of the image: faster processing, and prevents detecting stuff
  # in the background
  minX = int(config['zone']['minX'] * width)
  maxX = int(config['zone']['maxX'] * width)
  focusHeight = config['zone']['height']
  focusY = height * config['zone']['y']
  if (minX > maxX): minX, maxX = maxX, minX
  if (focusY < focusHeight/2): focusY = math.ceil(focusHeight/2)
  if (focusY > height-focusHeight/2): focusY = math.floor(height-focusHeight/2)
  minY = int(focusY - focusHeight/2)
  maxY = int(focusY + focusHeight/2)
  focus = frame[minY:maxY,minX:maxX]
  height, width, _ = focus.shape
  
  # 'optimised' version of: cv2.cvtColor(focus, cv2.COLOR_BGR2GRAY)
  focus = focus[:,:,0]

  # We need a 1d array of values for processing. The focus area is a rectangle,
  # so we average the values on the vertical axis.
  # This reduces the effect of camera noise on the detection, giving a more
  # stable output
  baseData = np.average(focus, axis=0)

  # Compute some metrics for 'auto-calibration'
  average = np.average(baseData)
  maxValue = np.max(baseData)
  distToAvg = np.abs(baseData-average)
  avgDistToAvg = np.average(distToAvg)

  # Find the peak
  treshold = (maxValue + average) / 2
  clean = np.zeros(width, focus.dtype)
  clean[baseData > treshold] = 255
  peaks, _ = find_peaks(clean, height=avgDistToAvg, distance=1000, width=10)

  # create the display image
  display = np.zeros((100, width, 3), focus.dtype)
  display[0:50,:] = baseData[:,np.newaxis]
  display[50:100, baseData > treshold] = 255
  for peak in peaks:
    cv2.line(display, (peak, 0), (peak, 100), (0,0,255), 3)

  # Only send if the peak count is 1
  peak = None
  outputImg = None
  if len(peaks == 1):
    peak = peaks[0] / float(width) - 0.5
  if config["display"]:
    retval, buffer = cv2.imencode('.jpg', display)
    outputImg = base64.b64encode(buffer)
  return peak, outputImg

def init():
  # set_camera(0)
  set_camera('recordings/swing.mov')

def set_camera(camera_id):
  global cap
  cap = cv2.VideoCapture(camera_id)

def stop():
  cap.release()
  cv2.destroyAllWindows()