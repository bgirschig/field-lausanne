import * as THREE from 'three';
import SlideshowImage from "./SlideshowImage.js";

// config
const NEAR = 0;
const FAR = 100;

// state
let images = [];
let imagesCache = {};

// unloadOldest
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, NEAR, FAR );
var renderer = new THREE.WebGLRenderer();
scene.background = new THREE.Color( 0x999 );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function cache(images, clear=false) {
  if (clear) imagesCache = {};
  if (!Array.isArray(images)) images = [images];
  images.forEach(img => {
    if (!imagesCache[img]) imagesCache[img] = new SlideshowImage( img, { fit: 'cover'} );
  });
}

function load(img) {
  // make sure this img is in the cache
  cache(img);
  
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
  requestAnimationFrame(loop);
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
  load, cache, unloadOldest,
  get images() {
    return images;  
  },
  get lastImage() {
    return images[images.length -1];
  },
  get empty() {
    return images.length === 0;
  },
  get test() {
    if (this.lastImage) return this.lastImage.transition;
    return 0;
  },
  set test(val) {
    if (this.lastImage) this.lastImage.transition = val;
  }
}