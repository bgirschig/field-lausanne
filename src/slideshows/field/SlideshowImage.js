import * as THREE from 'three';
import UnlitTextureMaterial from "@/materials/UnlitTextureMaterial";

const MAX_BLUR = 0.5;
const FADE_SPEED = 60;
const FADE_LERP_FACTOR = 1/FADE_SPEED;

export default class SlideshowImage extends THREE.Mesh {
  constructor(imgData) {
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new UnlitTextureMaterial();

    super( geometry, material );
    this.needsRender = false;
    
    this.targetBlur = 0;
    this.targetAlpha = 1;

    this.scale.x = imgData.original_ratio;
    const texture = new THREE.TextureLoader().load(imgData.url, () => {
      this.material.update();
      this.needsRender = true;
    });
    material.map = texture;
  }

  update() {
    if (this.animate) {
      this.material.blurSize += (this.targetBlur - this.material.blurSize) * FADE_LERP_FACTOR;
      this.material.alpha += (this.targetAlpha - this.material.alpha) * FADE_LERP_FACTOR;
      const blurDone = Math.abs(this.targetBlur - this.material.blurSize)  < 0.05;
      const alphaDone = Math.abs(this.targetAlpha - this.material.alpha) < 0.01;
      
      if (blurDone && alphaDone) {
        this.material.blurSize = this.targetBlur;
        this.material.alpha = this.targetAlpha;
        this.animate = false;
      }
    }
  }
  hide() {
    this.material.alpha = 0;
    this.material.blurSize = MAX_BLUR;
  }
  fadein() {
    this.targetBlur = 0;
    this.targetAlpha = 1;
    this.animate = true;
  }
  fadeout() {
    this.targetBlur = MAX_BLUR;
    this.targetAlpha = 0;
    this.animate = true;
  }
  smoothDelete() {
    this.pendingDeletion = true;
    this.fadeout();
  }
  get shouldDelete() {
    return this.pendingDeletion && this.material.alpha === 0;
  }
}