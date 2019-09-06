import SwingDetector from "@/detector";
import gui from '@/gui.js';
import instrumentRenderer from "@/instruments";
import slideshow from '@/slideshows/field/slideshow';
import state from "@/state";
import { seconds } from "@/utils/utils";


import '@/styles/main.css';
import '@/styles/splash.css';

let detector;

async function main() {  
  const request = await fetch('images/map.json')
  const imagesMap = await request.json();
  state.imagesMap = imagesMap;
  
  detector = new SwingDetector(onValue, onSleep);
  slideshow.init();
  gui(detector, instrumentRenderer);

  document.addEventListener('keyup', e => {
    if(e.key === 'ArrowRight') slideshow.nextSession();
  });

  // await seconds(1);
  slideshow.startSession();
}

function onValue(e) {
  instrumentRenderer.update(e);
  slideshow.onDetectorValue(e);
}

function onSleep(sleep) {
  if (sleep) slideshow.nextSession();
}


main();