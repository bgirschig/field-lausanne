import Session from "./Session.js";
import SwingDetector from "./SwingDetector.js";
import gui from './gui.js';
import './main.css';
import instrumentRenderer from "./instrumentRenderer";

let swingDetector;
let session;

async function main() {
  swingDetector = new SwingDetector(onValue);
  session = new Session();
  await swingDetector.waitConnection();
  gui(swingDetector, instrumentRenderer);
}

function onValue(e) {
  instrumentRenderer.update(e);
  if (session) session.onValue(e);
}

main();