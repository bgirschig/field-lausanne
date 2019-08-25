import SwingDetector from "./SwingDetector.js";
import gui from './gui.js';
import './main.css';
import instrumentRenderer from "./instrumentRenderer";
import scene from './scene.js';
import { sources } from "./data.js";
import { randomPick, shuffle } from "./utils.js";

let swingDetector;
let swapped = false;
let sessionSources = shuffle(randomPick(sources).slice(0));
let sessionIdx = 0;

async function main() {
  swingDetector = new SwingDetector(onValue);
  scene.load(sources[1][0]);
  scene.lastImage.transition = 0.99;

  await swingDetector.waitConnection();
  gui(swingDetector, instrumentRenderer);
}

function onValue(e) {
  instrumentRenderer.update(e);

  // We need to update only if 'scene' has an image
  if (scene.lastImage) {
    if (e.direction === 'forward' && e.prevDirection === 'backward') swapped = false;
    if (swapped) return;
    
    if (e.direction === 'forward' || scene.lastImage.transition > 0.8) {
      scene.lastImage.transition += Math.abs(e.smoothedValue) * 0.2;
    }

    if (scene.lastImage.transition >= 1) {
      scene.unloadOldest();
      scene.load(sessionSources[sessionIdx]);
      sessionIdx = (sessionIdx + 1) % sessionSources.length;
      swapped = true;
    }
  }
}

main();