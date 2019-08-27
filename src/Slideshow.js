import scene from './scene.js';
import { sources } from "./data.js";
import { randomPick, shuffle } from "./utils/utils";

let sessionSources;
let sessionIdx;
let swapped;

function startSession() {
  sessionIdx = 0;
  sessionSources = shuffle(randomPick(sources).slice());

  scene.cache(sessionSources);
  scene.load(sessionSources[sessionIdx++]);
}

function onDetectorValue(e) {
  // We need to update only if 'scene' has an image
  if (scene.empty) return;

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

export default {
  startSession, onDetectorValue
}