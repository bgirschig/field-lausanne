import SwingDetector from "@/detector";
import gui from '@/gui.js';
import instrumentRenderer from "@/instruments";
import slideshow from '@/slideshows/field/slideshow';
import StateMachine from "@/utils/StateMachine";

import '@/styles/main.css';
import '@/styles/splash.css';

let state;
let detector;

async function main() {
  state = new StateMachine({
    modes: ['splash', 'idle', 'swing'],
    onChange: onStateChange,
    logLevel: 'normal',
  });
  state.goto('splash');
  
  // Wait for the splash screen to be displayed, before initializing everything
  setTimeout(() => {
    detector = new SwingDetector(onValue, onSleep);
    slideshow.init();
    gui(detector, instrumentRenderer);
  }, 1500);

  setTimeout(()=> { state.goto('swing') }, 3000);
}

function onStateChange(prevMode, currentMode) {
  if (currentMode === 'swing') slideshow.startSession();
  if (currentMode === 'idle') slideshow.endSession();
}

function onValue(e) {
  instrumentRenderer.update(e);
  if (state.matchMode('swing')) slideshow.onDetectorValue(e);
}

function onSleep(sleep) {
  if (sleep) state.goto('idle');
  else state.goto('swing');
}

main();