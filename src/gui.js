import * as dat from 'dat.gui';

let detector;
let insruments;

export default async function init(_detector, _insruments) {
  detector = _detector;
  insruments = _insruments;

  // const cameras = await detector.getCameraList();
  // const cameraMap = {};
  // cameras.forEach((label, idx) => cameraMap[label] = idx);

  const gui = new dat.GUI();
  gui.remember(detector);
  gui.remember(insruments);
  const detectorControls = gui.addFolder('detector');
  const detectorZoneControls = detectorControls.addFolder('zone');
  const recordControls = detectorControls.addFolder('record');
  const analysisControls = gui.addFolder('analysis');
  detectorControls.open();
  analysisControls.open();
  detectorZoneControls.close();
  recordControls.close();
  // detectorControls.add(detector, 'camera', cameraMap);
  detectorControls.add(detector, 'display');
  detectorZoneControls.add(detector.zone, 'minX', 0, 1);
  detectorZoneControls.add(detector.zone, 'maxX', 0, 1);
  detectorZoneControls.add(detector.zone, 'y', 0, 1);
  detectorZoneControls.add(detector.zone, 'height', 1, 50);
  recordControls.add(detector, 'record').listen();
  recordControls.add(detector, 'recordingName');
  recordControls.add(detector, 'downloadRecording');
  analysisControls.add(detector, 'active');
  analysisControls.add(detector, 'swap');
  analysisControls.add(detector, 'speedTreshold', 0, 0.008).onChange(onControlChange);
  analysisControls.add(detector, 'inertRange', 0, 0.5).onChange(onControlChange);
  analysisControls.add(detector, 'resetRange', 0, 0.3).onChange(onControlChange);
  analysisControls.add(detector, 'offset', -1.0, 1.0).onChange(onControlChange);
  gui.add(insruments, 'active').name('Show Instrument');

  gui.hide();

  onControlChange();
}

function onControlChange() {
  insruments.update({
    inertRange: detector.inertRange,
    resetRange: detector.resetRange,
    speedTreshold: detector.speedTreshold,
  });
}