import numpy as np
import cv2
from scipy.signal import find_peaks
import base64

cap = None

def detect(config):
  ret, frame = cap.read()
  frame = cv2.flip(frame, 1)

  # extract frame height
  height, width, _ = frame.shape

  # Discard some of the image: faster processing, and prevents detecting stuff
  # in the background
  focus = frame[height//2-5:height//2+5]
  focus = cv2.cvtColor(focus, cv2.COLOR_BGR2GRAY)

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
    cv2.line(display, (peak, 0), (peak, height), (255,0,0), 1)

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
  set_camera(0)

def set_camera(camera_id):
  global cap
  cap = cv2.VideoCapture(camera_id)

def stop():
  cap.release()
  cv2.destroyAllWindows()