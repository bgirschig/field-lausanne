import { sources } from "@/data";
import ThreeScene from "@/ThreeScene";
import { randomPick, shuffle } from "@/utils/utils";
import SlideshowImage from "./SlideshowImage";
import * as THREE from 'three';

// utils
const DEG2RAD = Math.PI / 180;

// config
const Z_SPACING = 1;

// state
let sessionSources;
let sessionIdx;
let stage;
let images;
const cameraTarget = new THREE.Vector3();
let maxZ = 0;

function init() {
  stage = new ThreeScene();
  stage.scene.background = new THREE.Color(0xcccccc);
  stage.camera.position.setZ(2);
  loop();
}

function startSession() {
  sessionIdx = 0;
  sessionSources = shuffle(randomPick(sources).slice()).slice(0,3);
  images = sessionSources.map((src, idx) => {
    const image = new SlideshowImage(src);
    new THREE.Vector3();
    placeImage(image);
    stage.scene.add(image);
    return image;
  });
  
  next();
}

/** Move the camera to fit the target image */
function fitCamera(image, margin=0.2) {
  var box = new THREE.Box3();
  box.setFromObject( image );
  const imgHeight = box.max.y - box.min.y + margin;
  const distance = imgHeight / (2 * Math.tan(stage.camera.fov*DEG2RAD/2));
  cameraTarget.set(
    image.position.x,
    image.position.y,
    image.position.z + distance,
  )
}

function loop() {
  if (images) {
    stage.camera.position.lerp(cameraTarget, 0.05);
    if (stage.camera.position.distanceTo(cameraTarget) < 0.01) next();
    images.forEach(image => {
      if (image.position.z > stage.camera.position.z) {
        placeImage(image );
      };
    })
    stage.render();
  }
  requestAnimationFrame(loop);
}

function placeImage ( image ) {
  image.position.set(
    Math.random()-0.5,
    Math.random()-0.5,
    maxZ,
  );
  maxZ -= Z_SPACING;
}

function next() {
  fitCamera(images[sessionIdx]);
  sessionIdx ++;
  if (sessionIdx >= images.length) {
    sessionIdx = 0;
    const delta = images[0].position.z;
    stage.scene.children.forEach(child => child.position.setZ(child.position.z - delta));
    stage.camera.position.setZ(stage.camera.position.z - delta);
    cameraTarget.setZ(cameraTarget.z - delta);
    maxZ -= delta;
  }
}

function onDetectorValue(e) {
  return;
}

init();

export default {
  startSession, onDetectorValue,
}