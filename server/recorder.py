import detector
import time
import numpy as np
from matplotlib import pyplot as plt

outputName = 'recordings/cancels.csv'
config = {
  'camera': 0,
  'display': False,
  'zone': {
    'minX': 0,
    'maxX': 1,
    'y': 0.5,
    'height': 10,
  }
}

idx = 0
detector.init()

try:
  with open(outputName, 'w+') as f:
    f.write('time, value\n')
    start_time = time.time()
    while True:
      idx += 1
      currentTime = time.time()-start_time
      value, display = detector.detect(config)
      value = value or 'nan'
      f.write("{},{}\n".format(currentTime, value))
except KeyboardInterrupt:
  print "plotting results..."
  data = np.loadtxt(outputName, delimiter=',', skiprows=1)
  plt.plot(data[:,0], data[:,1])
  print "check out plot window"
  plt.show()