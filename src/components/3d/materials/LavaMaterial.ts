import * as THREE from "three";
import { lavaFragmentShader, lavaVertexShader } from "../shaders/lava";
import { sharedUniforms } from "./sharedUniforms";

export function createLavaMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: lavaVertexShader,
    fragmentShader: lavaFragmentShader,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uFogColor: sharedUniforms.uFogColor,
      uFogDensity: sharedUniforms.uFogDensity,
      uFlow: { value: 0 },
    },
  });
}
