import * as THREE from "three";
import { auroraFragmentShader, auroraVertexShader } from "../shaders/aurora";
import { sharedUniforms } from "./sharedUniforms";

interface AuroraOptions {
  colorA?: THREE.ColorRepresentation;
  colorB?: THREE.ColorRepresentation;
  wave?: number;
  /** 1 fades ribbons seen edge-on or point-blank — for shafts the camera
   *  travels THROUGH (the ocean cathedral). 0 (default) keeps the ribbon at
   *  full presence from any angle — the forest curtains live at grazing
   *  angles by design. */
  viewFade?: number;
}

/** Additive ribbon — moonlight curtains and underwater light shafts share it. */
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
      uViewFade: { value: options.viewFade ?? 0 },
      uColorA: { value: new THREE.Color(options.colorA ?? 0x0dbf80) },
      uColorB: { value: new THREE.Color(options.colorB ?? 0x3359e6) },
    },
  });
}
