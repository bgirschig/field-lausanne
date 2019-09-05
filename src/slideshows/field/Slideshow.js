import { sources } from "@/data";
import ThreeScene from "@/ThreeScene";
import { randomPick, shuffle, clamp, smoothStep } from "@/utils/utils";
import SlideshowImage from "./SlideshowImage";
import * as THREE from 'three';

// utils
const DEG2RAD = Math.PI / 180;

// scene config
const MAX_CAMERA_Z = 100;
// image placement config
const Z_SPACING = 0.8;
const SPREAD = 3;
const MARGIN = 0.2;

// state
let sessionSources;
let sessionIdx;
let stage;
let images;
let inSession;
let cameraSmoothFactor = 0.1;
const prevCameraPos = new THREE.Vector3();
const nextCameraPos = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
let maxZ;
let lock;
let transitionPercent;

function init() {
  stage = new ThreeScene();
  loop();
}

function startSession() {
  if (inSession) return;

  stage.camera.position.setZ(4);
  prevCameraPos.copy(stage.camera.position);
  nextCameraPos.copy(stage.camera.position);
  cameraTarget.copy(stage.camera.position);

  sessionSources = shuffle(randomPick(sources).slice());
  lock = false;
  maxZ = 0;
  sessionIdx = 0;
  cameraSmoothFactor = 0.1;
  transitionPercent = 0;
  if (images) images.forEach(image => stage.scene.remove(image));
  images = sessionSources.map(src => {
    const image = new SlideshowImage(src);
    new THREE.Vector3();
    placeImage(image);
    stage.scene.add(image);
    return image;
  });
  
  inSession = true;
  targetImage(images[0]);
}

function endSession() {
  if (!inSession) return;
  inSession = false;
  cameraSmoothFactor = 0.01;
  cameraTarget.setZ(cameraTarget.z + 4);

  
  images.forEach(image => {
    setTimeout(()=>image.smoothDelete(), 1000 + Math.random()*500);
  });
}

function loop() {
  requestAnimationFrame(loop);
  if (!images) return;

  stage.camera.position.lerp(cameraTarget, cameraSmoothFactor);

  // Visually, the camera is constantly moving forwards. To make avoid
  // overflowing the float coordinates, we move the whole scene back when the
  // camera reaches a certain treshold
  if (stage.camera.position.z < -MAX_CAMERA_Z) offsetScene(-stage.camera.position.z);

  images = images.filter(image => {
    // update alpha and blur animation
    image.update();
    // delete images if needed
    if (image.shouldDelete) {
      stage.scene.remove(image);
      return false;
    }
    // When the camera is past this image, re-position it at the end of the slideshow
    if (image.position.z > stage.camera.position.z - stage.camera.near) placeImage(image);
    
    return true;
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
  setTimeout(()=>image.fadein(), 500);
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
  console.log('offsetScene', zOffset);
  stage.scene.children.forEach(child => child.position.setZ(child.position.z + zOffset));
  stage.camera.position.setZ(stage.camera.position.z + zOffset);
  nextCameraPos.setZ(nextCameraPos.z + zOffset);
  prevCameraPos.setZ(prevCameraPos.z + zOffset);
  cameraTarget.setZ(cameraTarget.z + zOffset);
  maxZ -= zOffset;
}

function onDetectorValue(e) {
  if (!inSession) return;
  if (!lock) {
    if (e.delta < 0) transitionPercent += e.delta * 0.2;
    if (e.delta > 0) transitionPercent += e.delta * 1.3;
    transitionPercent = clamp(transitionPercent);

    cameraTarget.lerpVectors(prevCameraPos, nextCameraPos, smoothStep(0, 1, transitionPercent));
    if (transitionPercent >= 1) {
      transitionPercent = 0;
      sessionIdx = (sessionIdx + 1) % images.length;
      targetImage(images[sessionIdx]);
      prevCameraPos.copy(cameraTarget);
      lock = true;
    }
  }

  if (lock && e.direction === 'forward' && e.prevDirection === 'backward') lock = false;
  return;
}

export default {
  init, startSession, endSession, onDetectorValue,
}