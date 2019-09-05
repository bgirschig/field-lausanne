import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
varying float vDepth;

void main()	{
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  vDepth = gl_Position.z;
}
`;

const fragmentShader = `
varying vec2 vUv;
varying float vDepth;

uniform sampler2D map;
uniform float alpha;
uniform float blurSize;

float invAspect = 1.0;

#define SAMPLES 8.0

void main()	{
  vec4 sum = vec4( 0.0 );
  for(float indexX = 0.0; indexX < SAMPLES; indexX++){
    for(float indexY = 0.0; indexY < SAMPLES; indexY++){
      // get uv coordinate of sample
      vec2 offset = vec2(
        (indexX/(SAMPLES - 1.0) - 0.5) * blurSize * invAspect,
        (indexY/(SAMPLES - 1.0) - 0.5) * blurSize);
      // add color at position to color
      sum += texture2D(map, vUv + offset);
    }
  }

  gl_FragColor = sum / SAMPLES / SAMPLES;

  // gl_FragColor = texture2D( map, vUv );
  gl_FragColor.a = alpha * smoothstep(0.0, 0.3, vDepth);
}
`;

const uniforms = {
  map: { type: 't', value: 0 },
  alpha: { value: 1 },
  blurSize: { value: 0 },
  invAspect: { value: 1 },
}

export default class UnlitTextureMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: JSON.parse(JSON.stringify(uniforms)),
      vertexShader,
      fragmentShader,
      transparent: true
    });
  }
  update() {
    this.uniforms.invAspect.value = this.map.image.height/this.map.image.width;
    this.uniforms.invAspect.needsUpdate = true;
  }
  get blurSize() {
    return this.uniforms.blurSize.value;
  }
  set blurSize(value) {
    this.uniforms.blurSize.value = value;
    this.uniforms.blurSize.needsUpdate = true;
  }
  get map() {
    return this.uniforms.map.value;
  }
  set map(value) {
    this.uniforms.map.value = value;
    this.uniforms.map.needsUpdate = true;
  }
  get alpha() {
    return this.uniforms.alpha.value;
  }
  set alpha(value) {
    this.uniforms.alpha.value = value;
    this.uniforms.alpha.needsUpdate = true;
  }
}