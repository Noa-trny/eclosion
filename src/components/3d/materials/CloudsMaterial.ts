import * as THREE from "three";
import { cloudsFragmentShader, cloudsVertexShader } from "../shaders/clouds";
import { sharedUniforms } from "./sharedUniforms";

export function createCloudsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: cloudsVertexShader,
    fragmentShader: cloudsFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uWind: sharedUniforms.uWind,
      uFlash: sharedUniforms.uFlash,
      uFogColor: sharedUniforms.uFogColor,
      uDensity: { value: 0 },
    },
  });
}
