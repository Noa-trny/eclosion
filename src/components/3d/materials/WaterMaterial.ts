import * as THREE from "three";
import { waterFragmentShader, waterVertexShader } from "../shaders/water";
import { sharedUniforms } from "./sharedUniforms";

/** Gerstner surface — uWaveHeight is driven per frame from the proxies. */
export function createWaterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uSkyTop: sharedUniforms.uSkyTop,
      uSkyBottom: sharedUniforms.uSkyBottom,
      uSunDir: sharedUniforms.uSunDir,
      uSunColor: sharedUniforms.uSunColor,
      uSunIntensity: sharedUniforms.uSunIntensity,
      uFogColor: sharedUniforms.uFogColor,
      uFogDensity: sharedUniforms.uFogDensity,
      uWaveHeight: { value: 0.6 },
      uDeepColor: { value: new THREE.Color(0.006, 0.05, 0.08) },
      uShallowColor: { value: new THREE.Color(0.02, 0.18, 0.22) },
    },
  });
}
