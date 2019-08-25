import * as THREE from 'three';
import SlideshowImage from "./SlideshowImage.js";

// config
const NEAR = 0;
const FAR = 100;

// state
let images = [];

// unloadOldest
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, NEAR, FAR );
var renderer = new THREE.WebGLRenderer();
scene.background = new THREE.Color( 0x999 );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

export function load(src) {
  const img = new SlideshowImage( src, { fit: 'cover'} );
  images.push( img );
  scene.add(img);
  
  // sort images in the order of the array
  images.forEach((item, idx) => item.position.z = - (images.length - idx));

  renderer.render( scene, camera );
}

export function unloadOldest(keepOne = true) {
  if (keepOne && images.length <= 1) return;
  if (images.length === 0) return;
  console.log(images.length, scene.children.length);
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
    renderer.render( scene, camera );
  }
}
loop();

export default {
  load, unloadOldest,
  get images() {
    return images;  
  },
  get lastImage() {
    return images[images.length -1];
  },
  get test() {
    if (this.lastImage) return this.lastImage.transition;
    return 0;
  },
  set test(val) {
    if (this.lastImage) this.lastImage.transition = val;
  }
}