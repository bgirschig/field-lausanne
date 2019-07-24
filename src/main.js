import * as slidewhow from "./Slideshow.js";
import SwingDetector from "./SwingDetector.js";
import * as data from "./data.js";
import * as dat from 'dat.gui';
import './main.css';

let gui;
let swingDetector;

async function main() {
  swingDetector = new SwingDetector(onValue);
  slidewhow.init(data.sources);
  
  const cameras = await swingDetector.getCameraList();
  const cameraMap = {};
  cameras.forEach((label, idx) => cameraMap[label] = idx);

  gui = new dat.GUI();
  const detectorControls = gui.addFolder('detector');
  detectorControls.open();
  detectorControls.add(swingDetector, 'active');
  detectorControls.add(swingDetector, 'display');
  detectorControls.add(swingDetector, 'camera', cameraMap);
  gui.remember(swingDetector);
}

function onValue(e) {
  // console.log(e.value);
  if (e.apogee === 'back') {
    slidewhow.next({ autoPlay: true });
  }

  // if (slidewhow.transitionValue < e.absValue) slidewhow.setTransitionValue(e.absValue);
}

main();