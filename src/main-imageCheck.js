import ThreeScene from "@/ThreeScene";
import SlideshowImage from "./slideshows/field/SlideshowImage";
import * as THREE from 'three';
import { clamp } from "./utils/utils";
import state from "@/state";

const stage = new ThreeScene();
let mouseDown = false;
let pMousePos;
let renderPromise;

async function main() {
  const request = await fetch('images/map.json')
  const imagesMap = await request.json();

  state.offsetAspect = 0;
  stage.updateScreen();
  stage.background = 0xcccccc;
  stage.camera.position.setZ(6);
  console.log(state.screenRatio, state.screenWidth, state.screenHeight);
  
  const sessionPromises = imagesMap.map((sessionInfos, sessionIdx) => {
    return loadSession(sessionInfos, sessionIdx*1.1);
  });
  await Promise.all(sessionPromises);

  stage.render();

  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', () => mouseDown=false);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('wheel', onScroll);
}

async function loadSession(sessionSources, posY=0) {
  let currentX = 0;
  let imagePromises = sessionSources.map((imgData, imageIdx) => {
    currentX += imgData.original_ratio / 2;
    const image = new SlideshowImage(imgData);
    image.position.set(
      currentX, posY, 0,
    );
    currentX += imgData.original_ratio / 2;
    currentX += 0.1; // margin
    stage.scene.add(image);
    return image.waitReady;
  });
  await Promise.all(imagePromises);
}

function onMouseMove(e) {
  if (!mouseDown) return;

  const delta = {x: e.clientX - pMousePos.x, y: e.clientY - pMousePos.y};
  pMousePos = {x: e.clientX, y: e.clientY};

  const dragScale = 0.02 * (stage.camera.position.z / 4);
  stage.camera.position.add(new THREE.Vector3(-delta.x*dragScale, delta.y*dragScale, 0));
  requestRender();
}

function onMouseDown(e) {
  pMousePos = {x: e.clientX, y: e.clientY};
  mouseDown=true;
}

function onScroll(e) {
  let newZ = stage.camera.position.z + e.deltaY * 0.1;
  newZ = clamp(newZ, 1, 10);
  stage.camera.position.setZ(newZ);
  requestRender();
}

function requestRender() {
  if (renderPromise) return;
  renderPromise = requestAnimationFrame(()=>{
    renderPromise = null;
    stage.render();
  });
}

main();