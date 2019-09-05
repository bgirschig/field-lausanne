import SwingDetector from "@/detector";
import gui from '@/gui.js';
import instrumentRenderer from "@/instruments";
import slideshow from '@/slideshows/field/slideshow';
import StateMachine from "@/utils/StateMachine";
import state from "@/state";

import '@/styles/main.css';
import '@/styles/splash.css';

let stateMahine;
let detector;

async function main() {
  stateMahine = new StateMachine({
    modes: ['splash', 'idle', 'swing'],
    onChange: onStateChange,
    logLevel: 'normal',
  });
  
  const request = await fetch('images/map.json')
  const imagesMap = await request.json();
  state.imagesMap = imagesMap;

  stateMahine.goto('splash');
  
  // Wait for the splash screen to be displayed, before initializing everything
  setTimeout(() => {
    detector = new SwingDetector(onValue, onSleep);
    slideshow.init();
    gui(detector, instrumentRenderer);
  }, 1500);

  setTimeout(()=> { stateMahine.goto('swing') }, 3000);
}

function onStateChange(prevMode, currentMode) {
  if (currentMode === 'swing') slideshow.startSession();
  if (currentMode === 'idle') slideshow.endSession();
}

function onValue(e) {
  instrumentRenderer.update(e);
  if (stateMahine.matchMode('swing')) slideshow.onDetectorValue(e);
}

function onSleep(sleep) {
  if (sleep) stateMahine.goto('idle');
  else stateMahine.goto('swing');
}

main();