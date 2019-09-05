import * as THREE from 'three';
import state from "@/state";

export default class ThreeScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer();

    this.updateScreen();
    state.addListener('change', this.updateScreen.bind(this));
    
    document.body.appendChild( this.renderer.domElement );
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  updateScreen() {
    this.renderer.setSize( state.screenWidth, state.screenHeight );
    this.scene.background = state.debug ? new THREE.Color(0xff00ff) : new THREE.Color(0);
    this.camera.aspect = state.screenRatio * (state.offsetAspect + 1);
    this.camera.updateProjectionMatrix();

    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.left = `${state.offsetLeft}px`;
    this.renderer.domElement.style.top = `${state.offsetTop}px`;

    this.render();
  }
}