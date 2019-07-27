# Starfield elysee
Starfield project adaptation for musée de l'élysée: a Swing-controlled Slideshow

## TODO
- Improve stability
  - Don't break on camera disconect
- detection settings ui
  - Select correct camera
  - focus zone
  - camera view
- Debugger
  - View detector status (angle, speed, apogee, etc...)
  - View detection images ?
- Intermediate states (idle, start, etc...)
- Auto launch (single server for files + socket ?)
- Auto Calibration
- Apogee detection:
  - Don't have the speed AND position requirements at the same time: flip a bit
  when in the correct position (reset when in reset range or on the other side)
  and trigger apogee as soon as speed gets over treshold
  - Predictive system: estimate next time from speed & previous values for faster
  response
