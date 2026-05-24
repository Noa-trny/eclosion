import * as THREE from "three";
import { seedFragmentShader, seedVertexShader } from "../shaders/seed";
import { sharedUniforms } from "./sharedUniforms";

/** The seed's pulsing husk — uGlow/uGerm are scrubbed by the seed act. */
export function createGlowSeedMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: seedVertexShader,
    fragmentShader: seedFragmentShader,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uFogColor: sharedUniforms.uFogColor,
      uFogDensity: sharedUniforms.uFogDensity,
      uGlow: { value: 0 },
      uGerm: { value: 0 },
    },
  });
}
