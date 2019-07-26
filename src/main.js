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
  
  const cameras = await swingDetector.getCameraList();
  const cameraMap = {};
  cameras.forEach((label, idx) => cameraMap[label] = idx);

  await swingDetector.waitConnection();

  gui = new dat.GUI();
  gui.remember(swingDetector);
  gui.remember(instrumentRenderer);
  const detectorControls = gui.addFolder('detector');
  const analysisControls = gui.addFolder('analysis');
  detectorControls.open();
  analysisControls.open();
  detectorControls.add(swingDetector, 'camera', cameraMap);
  detectorControls.add(swingDetector, 'display');
  analysisControls.add(swingDetector, 'active');
  analysisControls.add(swingDetector, 'swap');
  analysisControls.add(swingDetector, 'apogeeSpeedTreshold', 0, 0.2).onChange(onControlChange);
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