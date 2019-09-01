import { sources } from "@/data";
import ThreeScene from "@/ThreeScene";
import { randomPick, shuffle, clamp, smoothStep } from "@/utils/utils";
import SlideshowImage from "./SlideshowImage";
import * as THREE from 'three';

// utils
const DEG2RAD = Math.PI / 180;

// config
const MAX_CAMERA_Z = 1000;
// settings
const Z_SPACING = 0.8;
const SPREAD = 3;
const MARGIN = 0.2;

// state
let sessionSources;
let sessionIdx;
let stage;
let images;
const prevCameraPos = new THREE.Vector3();
const nextCameraPos = new THREE.Vector3();
let maxZ = 0;
let lock = false;
let transitionPercent = 0;

function init() {
  stage = new ThreeScene();
  stage.scene.background = new THREE.Color(0xcccccc);
  stage.camera.position.setZ(4);
  prevCameraPos.copy(stage.camera.position);
  startSession();
  loop();
}

function startSession() {
  sessionIdx = 0;
  sessionSources = shuffle(randomPick(sources).slice());
  // sessionSources = sources[0].slice(0,3);
  images = sessionSources.map((src, idx) => {
    const image = new SlideshowImage(src);
    new THREE.Vector3();
    placeImage(image);
    stage.scene.add(image);
    return image;
  });
  
  targetImage(images[0]);
}

function loop() {
  requestAnimationFrame(loop);
  if (!images) return;

  // Visually, the camera is ocnstantly moving forwards. To make avoid
  // overflowing the float coordinates, we move the whole scene back when the
  // camera reaches a certain treshold
  if (stage.camera.position.z > MAX_CAMERA_Z) offsetScene(-stage.camera.position.z);

  images.forEach(image => {
    // update alpha and blur animation
    image.update();
    // When the camera is past this image, re-position it at the end of the slideshow
    if (image.position.z > stage.camera.position.z) placeImage(image);
  });

  stage.render();
}

function placeImage ( image ) {
  image.hide();
  image.position.set(
    (Math.random()-0.5) * SPREAD,
    (Math.random()-0.5) * SPREAD,
    maxZ,
  );
  image.fadein();
  maxZ -= Z_SPACING;
}

function targetImage(image) {
  // Find out the position the camera must reach so that the next image fits in
  // the view
  const imgHeight = 1 + MARGIN;
  const distance = imgHeight / (2 * Math.tan(stage.camera.fov*DEG2RAD/2));
  nextCameraPos.set(
    image.position.x,
    image.position.y,
    image.position.z + distance,
  );
}

function offsetScene(zOffset) {
  console.log('offset', zOffset);
  stage.scene.children.forEach(child => child.position.setZ(child.position.z + zOffset));
  stage.camera.position.setZ(stage.camera.position.z + zOffset);
  nextCameraPos.setZ(nextCameraPos.z + zOffset);
  prevCameraPos.setZ(prevCameraPos.z + zOffset);
  maxZ -= zOffset;
}

function onDetectorValue(e) {
  if (!lock) {
    if (e.delta < 0) transitionPercent += e.delta * 0.2;
    if (e.delta > 0) transitionPercent += e.delta * 1.0;
    transitionPercent = clamp(transitionPercent);

    stage.camera.position.lerpVectors(prevCameraPos, nextCameraPos, smoothStep(0, 1, transitionPercent));
    if (transitionPercent >= 1) {
      transitionPercent = 0;
      sessionIdx = (sessionIdx + 1) % images.length;    
      targetImage(images[sessionIdx]);
      prevCameraPos.copy(stage.camera.position);
      lock = true;
    }
  }

  if (lock && e.direction === 'forward' && e.prevDirection === 'backward') {
    lock = false;
  }
  return;
}

export default {
  init, startSession, onDetectorValue,
}