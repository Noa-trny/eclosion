import * as THREE from "three";
import { skyFragmentShader, skyVertexShader } from "../shaders/sky";
import { sharedUniforms } from "./sharedUniforms";

/** The persistent sky dome — every act recolors it through the proxies. */
export function createSkyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uSkyTop: sharedUniforms.uSkyTop,
      uSkyBottom: sharedUniforms.uSkyBottom,
      uSunDir: sharedUniforms.uSunDir,
      uSunColor: sharedUniforms.uSunColor,
      uSunIntensity: sharedUniforms.uSunIntensity,
      uFlash: sharedUniforms.uFlash,
      uFogColor: sharedUniforms.uFogColor,
      uAurora: { value: 0 },
      uUnderwater: { value: 0 },
    },
  });
}
