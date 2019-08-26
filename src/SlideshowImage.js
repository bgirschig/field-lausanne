import * as THREE from 'three';
import { clamp, smoothStep } from './utils.js'

const maxScale = 1.5;

export default class SlideshowImage extends THREE.Mesh {
  constructor(src, { fit = 'cover' } = {}) {
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { type: 't', value: 0 },
        transition: { value: 0 },
        aspect: { value: 1.0 },
        scale: { value: 1.0 },
      },
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      transparent: true,
    });

    super( geometry, material );
    
    const texture = new THREE.TextureLoader().load(src, this.onload.bind(this));
    material.uniforms.map.value = texture;
    this.fit = fit;
    this.needsRender = false;
    this.reset();
  }

  reset() {
    this.transition = 0;
    this.scaleAnimPos = 0;
    this.textureScale = 1.0;
  }

  onload(e) {
    const ratio = e.image.width / e.image.height;
    const screenRatio = window.innerWidth / window.innerHeight;

    this.material.uniforms.aspect.value = screenRatio;

    if (this.fit === 'contain') {
      if (screenRatio > ratio) {
        this.scale.y = window.innerHeight;
        this.scale.x = window.innerHeight * ratio;
      } else {
        this.scale.x = window.innerWidth;
        this.scale.y = window.innerWidth / ratio;
      }
    } else if (this.fit === 'cover') {
      if (screenRatio > ratio) {
        this.scale.x = window.innerWidth;
        this.scale.y = window.innerWidth / ratio;
      } else {
        this.scale.y = window.innerHeight;
        this.scale.x = window.innerHeight * ratio;
      }
    }
    this.needsRender = true;
  }

  set transition(value) {
    value = clamp(value);
    if (value !== this.transition) this.needsRender = true;
    this.material.uniforms.transition.value = value;
    this.material.uniforms.transition.needsUpdate = true;
  }
  get transition() {
    return this.material.uniforms.transition.value;
  }

  set textureScale(value) {
    value = clamp(value, 0, maxScale);
    if (value !== this.textureScale) this.needsRender = true;
    this.material.uniforms.scale.value = value;
  }
  get textureScale() {
    return this.material.uniforms.scale.value;
  }

  update() {
    this.scaleAnimPos += 0.001;
    if (this.scaleAnimPos <= 1) {
      this.textureScale = 1 + smoothStep(0, 1, this.scaleAnimPos);
    }
  }
}