import * as THREE from 'three';

export default class SlideshowImage extends THREE.Mesh {
  constructor(src) {
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial({});

    super( geometry, material );
    this.needsRender = false;
    
    const texture = new THREE.TextureLoader().load(src, texture => {
      this.scale.x = texture.image.width / texture.image.height;
      this.needsRender = true;
    });
    material.map = texture;
  }
}