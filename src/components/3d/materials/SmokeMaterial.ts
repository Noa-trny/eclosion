import * as THREE from "three";
import { smokeFragmentShader, smokeVertexShader } from "../shaders/smoke";
import { sharedUniforms } from "./sharedUniforms";

export function createSmokeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uWind: sharedUniforms.uWind,
      uDensity: { value: 0 },
      uEmber: { value: 0 },
      uRise: { value: 40 },
      uScale: { value: 1 },
      uColor: { value: new THREE.Color(0.16, 0.14, 0.14) },
    },
  });
}
