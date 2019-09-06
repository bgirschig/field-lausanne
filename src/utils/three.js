import * as THREE from 'three';

export function texturePromise(url) {
  return new Promise((resolve)=>{
    new THREE.TextureLoader().load(url, resolve);
  })
}