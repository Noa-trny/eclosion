import * as THREE from "three";
import { auroraFragmentShader, auroraVertexShader } from "../shaders/aurora";
import { sharedUniforms } from "./sharedUniforms";

interface AuroraOptions {
  colorA?: THREE.ColorRepresentation;
  colorB?: THREE.ColorRepresentation;
  wave?: number;
}

/** Additive ribbon — sky aurora and underwater light shafts share it. */
export function createAuroraMaterial(options: AuroraOptions = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: auroraVertexShader,
    fragmentShader: auroraFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uIntensity: { value: 0 },
      uWave: { value: options.wave ?? 1 },
      uColorA: { value: new THREE.Color(options.colorA ?? 0x0dbf80) },
      uColorB: { value: new THREE.Color(options.colorB ?? 0x3359e6) },
    },
  });
}
