import * as dat from 'dat.gui';

let swingDetector;
let instrumentRenderer;

export default async function init(_swingDetector, _instrumentRenderer) {
  swingDetector = _swingDetector;
  instrumentRenderer = _instrumentRenderer;

  const cameras = await swingDetector.getCameraList();
  const cameraMap = {};
  cameras.forEach((label, idx) => cameraMap[label] = idx);

  const gui = new dat.GUI();
  gui.remember(swingDetector);
  gui.remember(instrumentRenderer);
  const detectorControls = gui.addFolder('detector');
  const detectorZoneControls = detectorControls.addFolder('zone');
  const recordControls = detectorControls.addFolder('record');
  const analysisControls = gui.addFolder('analysis');
  detectorControls.open();
  analysisControls.open();
  detectorZoneControls.close();
  recordControls.close();
  // detectorControls.add(swingDetector, 'camera', cameraMap);
  detectorControls.add(swingDetector, 'display');
  detectorZoneControls.add(swingDetector.zone, 'minX', 0, 1);
  detectorZoneControls.add(swingDetector.zone, 'maxX', 0, 1);
  detectorZoneControls.add(swingDetector.zone, 'y', 0, 1);
  detectorZoneControls.add(swingDetector.zone, 'height', 1, 50);
  recordControls.add(swingDetector, 'record').listen();
  recordControls.add(swingDetector, 'recordingName');
  recordControls.add(swingDetector, 'downloadRecording');
  analysisControls.add(swingDetector, 'active');
  analysisControls.add(swingDetector, 'swap');
  analysisControls.add(swingDetector, 'apogeeSpeedTreshold', 0, 0.008).onChange(onControlChange);
  analysisControls.add(swingDetector, 'inertRange', 0, 0.5).onChange(onControlChange);
  analysisControls.add(swingDetector, 'resetRange', 0, 0.3).onChange(onControlChange);
  analysisControls.add(swingDetector, 'offset', -1.0, 1.0).onChange(onControlChange);
  gui.add(instrumentRenderer, 'active').name('Show Instrument');

  onControlChange();
}

function onControlChange() {
  instrumentRenderer.update({
    inertRange: swingDetector.inertRange,
    resetRange: swingDetector.resetRange,
    apogeeSpeedTreshold: swingDetector.apogeeSpeedTreshold,
  });
}