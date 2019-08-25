import * as THREE from 'three';

export default class SlideshowImage extends THREE.Mesh {
  constructor(src, { fit = 'cover' } = {}) {
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( );
    
    const material2 = new THREE.ShaderMaterial({
      uniforms: {
        map: { type: 't', value: 0 },
        transition: { value: 0 },
        aspect: { value: 1.0 },
      },
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      transparent: true,
    });

    super( geometry, material2 );
    
    const texture = new THREE.TextureLoader().load(src, this.onload.bind(this));
    material2.uniforms.map.value = texture;
    material.map = texture;

    this.fit = fit;
    this.src = src;
    this.needsRender = false;
    this.transition = 0;
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
    value = Math.min(1, Math.max(value, 0));
    if (value !== this.material.uniforms.transition.value) this.needsRender = true;
    this.material.uniforms.transition.value = value;
    this.material.uniforms.transition.needsUpdate = true;
  }
  get transition() {
    return this.material.uniforms.transition.value;
  }

  update() {
  }
}