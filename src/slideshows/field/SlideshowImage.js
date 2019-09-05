import * as THREE from 'three';
import UnlitTextureMaterial from "@/materials/UnlitTextureMaterial";
import { TweenLite, Power2 } from "gsap";

const MAX_BLUR = 0.5;

export default class SlideshowImage extends THREE.Mesh {
  constructor(imgData) {
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new UnlitTextureMaterial();

    super( geometry, material );
    this.needsRender = true;
    
    this.scale.x = imgData.original_ratio;
    const texture = new THREE.TextureLoader().load(imgData.url, () => {
      this.material.update();
      this.needsRender = true;
    });
    material.map = texture;
  }

  hide() {
    this.material.alpha = 0;
    this.material.blurSize = MAX_BLUR;
  }
  fadein() {
    if (this.fader) this.fader.kill();
    return new Promise((resolve) => {
      this.fader = TweenLite.to(this.material, 1.5, {
        blurSize: 0,
        alpha: 1,
        ease:Power2.easeInOut,
        onComplete: resolve,
        onUpdate: ()=> this.needsRender = true,
      });
    });
  }
  fadeout() {
    if (this.fader) this.fader.kill();
    return new Promise((resolve) => {
      this.fader = TweenLite.to(this.material, 4, {
        blurSize: MAX_BLUR,
        alpha: 0,
        ease:Power2.easeInOut,
        onComplete: resolve,
        onUpdate: ()=> this.needsRender = true,
      });
    });
  }
  smoothDelete() {
    this.pendingDeletion = true;
    this.fadeout();
  }
  get shouldDelete() {
    return this.pendingDeletion && this.material.alpha === 0;
  }
}