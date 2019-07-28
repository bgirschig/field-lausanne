import * as slidewhow from "./Slideshow.js";
import SwingDetector from "./SwingDetector.js";
import * as data from "./data.js";
import * as dat from 'dat.gui';
import './main.css';
import instrumentRenderer from "./instrumentRenderer";

let gui;
let swingDetector;

async function main() {
  swingDetector = new SwingDetector(onValue);
  slidewhow.init(data.sources);
  
  document.body.addEventListener('keyup', e => {
    if (e.key === 'n') slidewhow.next();
  });

  const cameras = await swingDetector.getCameraList();
  const cameraMap = {};
  cameras.forEach((label, idx) => cameraMap[label] = idx);

  await swingDetector.waitConnection();

  gui = new dat.GUI();
  gui.remember(swingDetector);
  gui.remember(instrumentRenderer);
  const detectorControls = gui.addFolder('detector');
  const detectorZoneControls = detectorControls.addFolder('zone');
  const analysisControls = gui.addFolder('analysis');
  detectorControls.open();
  analysisControls.open();
  detectorControls.add(swingDetector, 'camera', cameraMap);
  detectorControls.add(swingDetector, 'display');
  detectorZoneControls.add(swingDetector.zone, 'minX', 0, 1);
  detectorZoneControls.add(swingDetector.zone, 'maxX', 0, 1);
  detectorZoneControls.add(swingDetector.zone, 'y', 0, 1);
  detectorZoneControls.add(swingDetector.zone, 'height', 1, 50);
  analysisControls.add(swingDetector, 'active');
  analysisControls.add(swingDetector, 'swap');
  analysisControls.add(swingDetector, 'apogeeSpeedTreshold', 0, 0.08).onChange(onControlChange);
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

function onValue(e) {
  if (e.apogee === 'back') slidewhow.next({ autoPlay: true });
  instrumentRenderer.update(e);
}

main();