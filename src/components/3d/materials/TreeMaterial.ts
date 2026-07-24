import * as THREE from "three";
import { noiseChunk } from "../shaders/chunks/noise";
import { lightingChunk } from "../shaders/chunks/lighting";
import { sharedUniforms } from "./sharedUniforms";

const vertexShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uGrowth;
uniform vec3 uWind;
attribute vec3 aColor;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  // Trees grow from the ground: full vertical scale, trunks thicken later.
  float growth = clamp(uGrowth, 0.0, 1.0);
  vec3 transformed = position;
  transformed.y *= growth;
  transformed.xz *= 0.3 + 0.7 * growth;
  vec4 inst = instanceMatrix * vec4(transformed, 1.0);
  // Per-instance sway phase derived from the instance's world position.
  float phase = instanceMatrix[3][0] * 0.13 + instanceMatrix[3][2] * 0.29;
  float sway = snoise2(vec2(uTime * 0.35 + phase, phase)) * (0.4 + length(uWind.xz) * 0.35);
  inst.xz += uWind.xz * 0.018 * sway * max(transformed.y, 0.0);
  vec4 wp = modelMatrix * inst;
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vColor = aColor;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
${lightingChunk}
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorldPos;

uniform vec3 uSeasonTint;

void main() {
  float shade = halfLambert(vNormal, uSunDir);
  float light = shade * uSunIntensity;
  // Shadowed foliage picks up the cool sky, lit foliage the moon — contrast.
  vec3 ambient = mix(uAmbientColor * 0.55, uAmbientColor, shade);
  vec3 col = vColor * uSeasonTint * (ambient * uAmbientIntensity * 2.4 + uSunColor * light * 2.2);
  // Moon rim: silhouettes against the moonlit fog.
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float rim = fresnel(viewDir, normalize(vNormal), 2.5);
  col += uSunColor * rim * uSunIntensity * 0.35;
  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Instanced procedural trees: growth scale + wind sway, vertex-colored. */
export function createTreeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uWind: sharedUniforms.uWind,
      uSunDir: sharedUniforms.uSunDir,
      uSunColor: sharedUniforms.uSunColor,
      uSunIntensity: sharedUniforms.uSunIntensity,
      uAmbientColor: sharedUniforms.uAmbientColor,
      uAmbientIntensity: sharedUniforms.uAmbientIntensity,
      uFogColor: sharedUniforms.uFogColor,
      uFogDensity: sharedUniforms.uFogDensity,
      uGrowth: { value: 0 },
      uSeasonTint: { value: new THREE.Vector3(1, 1, 1) },
    },
  });
}
