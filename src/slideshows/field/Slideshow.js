import ThreeScene from "@/ThreeScene";
import { shuffle, clamp, smoothStep, seconds } from "@/utils/utils";
import SlideshowImage from "./SlideshowImage";
import * as THREE from 'three';
import state from '@/state';

// utils
const DEG2RAD = Math.PI / 180;

// scene config
const MAX_CAMERA_Z = 100;
// image placement config
const Z_SPACING = 0.95;
const SPREAD = 3;
const MARGIN = 0.2;

// state
let sessionSources;
let sessionIdx;
let imageIdx;
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
  sessionIdx = 0;
  loop();
}

async function startSession() {
  if (inSession) return;

  stage.camera.position.setZ(4);
  prevCameraPos.copy(stage.camera.position);
  nextCameraPos.copy(stage.camera.position);
  cameraTarget.copy(stage.camera.position);

  sessionSources = shuffle(state.imagesMap[sessionIdx].slice());
  lock = false;
  maxZ = 0;
  imageIdx = 0;
  cameraSmoothFactor = 0.1;
  transitionPercent = 0;
  
  if (images) images.forEach(image => stage.scene.remove(image));
  const promises = sessionSources.map(async (imgData, index) => {
    const image = new SlideshowImage(imgData);
    await image.waitReady;
    placeImage(image, index);
    stage.scene.add(image);
    return image;
  });
  maxZ = -sessionSources.length*Z_SPACING;
  images = await Promise.all(promises);

  inSession = true;
  targetImage(images[0]);

  sessionIdx = (sessionIdx + 1) % state.imagesMap.length;
}

function endSession() {
  if (!inSession) return;
  inSession = false;
  cameraSmoothFactor = 0.002;
  cameraTarget.setZ(cameraTarget.z + 4);

  const promises = images.map(async (image) => {
    await seconds(2); // wait for the camera to move out
    await seconds(Math.random() * 2); // spread the images disparition
    await image.fadeout(); // wait for the image to fade out before deleting it
    stage.scene.remove(image);
    images.splice(images.indexOf(image), 1);
  });

  return Promise.all(promises);
}

function loop() {
  requestAnimationFrame(loop);
  if (!images) return;
  let needsRender = false;

  if (Math.abs(stage.camera.position.z - cameraTarget.z) > 0.005) {
    needsRender = true;
    stage.camera.position.lerp(cameraTarget, cameraSmoothFactor);
  }

  // Visually, the camera is constantly moving forwards. To make avoid
  // overflowing the float coordinates, we move the whole scene back when the
  // camera reaches a certain treshold
  if (stage.camera.position.z < -MAX_CAMERA_Z) offsetScene(-stage.camera.position.z);

  images.forEach(image => {
    if (image.needsRender) needsRender = true;
    // When the camera is past this image, re-position it at the end of the slideshow
    if (image.position.z > stage.camera.position.z - stage.camera.near) {
      needsRender = true;
      placeImage(image);
    }
    image.needsRender = false;
  });

  if (needsRender) stage.render();
}

function placeImage ( image, index ) {
  image.hide();
  image.position.set(
    (Math.random()-0.5) * SPREAD,
    (Math.random()-0.5) * SPREAD,
    -index * Z_SPACING,
  );
  setTimeout(()=>image.fadein(), Math.random() * 1000);
}

function targetImage(image) {
  // Find out the position the camera must reach so that the next image fits in
  // the view
  const imgHeight = 1 + MARGIN;
  const imgWidth = image.scale.x + MARGIN;
  const imgRatio = imgWidth / imgHeight;
  const distanceH = imgHeight / (2 * Math.tan(stage.camera.fov*DEG2RAD/2));
  const distanceW = distanceH * imgRatio / stage.camera.aspect / (state.offsetAspect + 1);
  nextCameraPos.set(
    image.position.x,
    image.position.y,
    image.position.z + Math.min(Z_SPACING, Math.max(distanceW, distanceH)),
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
      imageIdx = (imageIdx + 1) % images.length;
      targetImage(images[imageIdx]);
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