import SwingDetector from "@/detector";
import gui from '@/gui.js';
import '@/main.css';
import instrumentRenderer from "@/instruments";
import slideshow from '@/slideshows/field/slideshow';
import StateMachine from "@/utils/StateMachine";

let state;
let detector;

async function main() {
  state = new StateMachine({
    modes: ['splash', 'idle', 'swing', 'debug'],
    onChange: onStateChange,
    logLevel: 'normal',
  });
  state.goto('splash');
  
  detector = new SwingDetector(onValue);
  gui(detector, instrumentRenderer);
}

function onStateChange(from, to) {
}

function onValue(e) {
  instrumentRenderer.update(e);
  slideshow.onDetectorValue(e);
}

main();