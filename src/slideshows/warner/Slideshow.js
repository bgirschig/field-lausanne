import { sources } from "@/data.js";
import { randomPick, shuffle } from "@/utils/utils";
import * as THREE from 'three';
import SlideshowImage from "./SlideshowImage";

// state
let images = [];
let imagesCache = {};
let sessionSources;
let sessionIdx;
let swapped;
let frameRequest;

// unloadOldest
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0, 100 );
var renderer = new THREE.WebGLRenderer();
scene.background = new THREE.Color( 0x999 );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function destroy() {
  cancelAnimationFrame(frameRequest);
}

function startSession() {
  sessionIdx = 0;
  sessionSources = shuffle(randomPick(sources).slice());

  preload(sessionSources);
  setImage(sessionSources[sessionIdx++]);
}

function onDetectorValue(e) {
  if (images.length === 0) return;

  if (e.direction === 'forward' && e.prevDirection === 'backward') swapped = false;
  if (swapped) return;
  
  if (e.direction === 'forward' || images[images.length -1].transition > 0.8) {
    images[images.length -1].transition += Math.abs(e.smoothedValue) * 0.2;
  }

  if (images[images.length -1].transition >= 1) {
    unloadOldest();
    setImage(sessionSources[sessionIdx]);
    sessionIdx = (sessionIdx + 1) % sessionSources.length;
    swapped = true;
  }
}

function preload(images, clear=false) {
  if (clear) imagesCache = {};
  if (!Array.isArray(images)) images = [images];
  images.forEach(img => {
    if (!imagesCache[img]) imagesCache[img] = new SlideshowImage( img, { fit: 'cover'} );
  });
}

function setImage(img) {
  // make sure this img is in the cache
  preload(img);
  
  // load up the image object
  const imageObject = imagesCache[img];
  imageObject.reset();
  images.push( imageObject );
  scene.add(imageObject);
  
  // sort images in the order of the array
  images.forEach((item, idx) => item.position.z = - (images.length - idx));

  renderer.render( scene, camera );
}

function unloadOldest(keepOne = true) {
  if (keepOne && images.length <= 1) return;
  if (images.length === 0) return;
  scene.remove(images[0]);
  images = images.slice(1);
}

function loop() {
  frameRequest = requestAnimationFrame(loop);
  let needsRender = false;
  images.forEach(image => {
    image.update();
    if (image.needsRender) needsRender = true;
    image.needsRender = false;
  });
  if (needsRender) {
    // console.log('render');
    renderer.render( scene, camera );
  }
}
loop();

export default {
  destroy, startSession, onDetectorValue,
}