import * as THREE from "three";
import { lightingChunk } from "../shaders/chunks/lighting";
import { sharedUniforms } from "./sharedUniforms";

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aPhase;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vGlow;

void main() {
  vec3 transformed = position;
#ifdef FISH
  // Tail wiggle: amplitude grows toward the tail (negative x).
  float wig = sin(uTime * 9.0 + aPhase + position.x * 3.0);
  transformed.z += wig * 0.14 * clamp(0.4 - position.x, 0.0, 1.4);
  vGlow = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase);
#endif
#ifdef BIRD
  // Wing flap: hinge at the body, tips (spanning ±z) travel furthest.
  float flap = sin(uTime * 8.0 + aPhase);
  transformed.y += flap * abs(position.z) * 0.55;
  vGlow = 0.0;
#endif
  vec4 inst = instanceMatrix * vec4(transformed, 1.0);
  vec4 wp = modelMatrix * inst;
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
${lightingChunk}
uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vGlow;

void main() {
  float light = halfLambert(vNormal, uSunDir) * uSunIntensity;
  vec3 col = uColor * (uAmbientColor * uAmbientIntensity * 3.0 + uSunColor * light * 2.2);
  col += uGlowColor * vGlow * 0.6;
  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Shared boids skin: FISH bends its tail, BIRD flaps its wings — both driven
 *  purely by uTime + the per-instance aPhase attribute. */
export function createCreatureMaterial(kind: "fish" | "bird", color: THREE.ColorRepresentation, glow: THREE.ColorRepresentation = 0x000000): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: kind === "fish" ? { FISH: "" } : { BIRD: "" },
    side: THREE.DoubleSide,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uSunDir: sharedUniforms.uSunDir,
      uSunColor: sharedUniforms.uSunColor,
      uSunIntensity: sharedUniforms.uSunIntensity,
      uAmbientColor: sharedUniforms.uAmbientColor,
      uAmbientIntensity: sharedUniforms.uAmbientIntensity,
      uFogColor: sharedUniforms.uFogColor,
      uFogDensity: sharedUniforms.uFogDensity,
      uColor: { value: new THREE.Color(color) },
      uGlowColor: { value: new THREE.Color(glow) },
    },
  });
}
