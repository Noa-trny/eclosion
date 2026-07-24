import * as THREE from "three";
import { noiseChunk } from "../shaders/chunks/noise";
import { lightingChunk } from "../shaders/chunks/lighting";
import { sharedUniforms } from "./sharedUniforms";

const vertexShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uBloom;
uniform vec2 uCenter;
uniform float uRadius;
uniform vec3 uWind;
attribute float aTip;
attribute float aPhase;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vTip;
varying float vPhase;
varying float vWave;

void main() {
  // The bloom PROPAGATES: a radial wave races out from the meadow's heart,
  // each corolla opening as the front reaches it.
  vec2 instXZ = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
  float reach = distance(instXZ, uCenter) / uRadius;
  float localBloom = clamp(uBloom * 1.7 - reach, 0.0, 1.0);
  // Just-opened corollas at the wave front glow briefly.
  vWave = smoothstep(0.05, 0.3, localBloom) * (1.0 - smoothstep(0.35, 0.75, localBloom));
  float fold = 1.0 - localBloom;
  vec3 transformed = position;
  transformed.xz *= 1.0 - fold * 0.72 * aTip;
  transformed.y += fold * aTip * aTip * 0.55;
  // Gentle sway.
  float sway = snoise2(vec2(uTime * 0.6 + aPhase, aPhase)) * 0.06;
  transformed.xz += uWind.xz * sway * (0.3 + transformed.y);
  vec4 inst = instanceMatrix * vec4(transformed, 1.0);
  vec4 wp = modelMatrix * inst;
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vTip = aTip;
  vPhase = aPhase;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
${lightingChunk}
uniform vec3 uCenterColor;
uniform vec3 uPetalColor;
uniform vec3 uPetalColorAlt;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vTip;
varying float vPhase;
varying float vWave;

void main() {
  vec3 petal = mix(uPetalColor, uPetalColorAlt, fract(vPhase * 7.31));
  vec3 albedo = mix(uCenterColor, petal, smoothstep(0.05, 0.5, vTip));
  float light = halfLambert(vNormal, uSunDir) * uSunIntensity;
  vec3 col = albedo * (uAmbientColor * uAmbientIntensity * 3.4 + uSunColor * light * 2.2);
  // The opening front carries its own light — a wave of luminescence.
  col += petal * vWave * 0.9;
  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Instanced flowers whose corolla opens with the bloom act's uBloom scrub. */
export function createFlowerMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
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
      uBloom: { value: 0 },
      uCenter: { value: new THREE.Vector2(0, 0) },
      uRadius: { value: 50 },
      uCenterColor: { value: new THREE.Color(0xffc24d) },
      uPetalColor: { value: new THREE.Color(0xe86fa4) },
      uPetalColorAlt: { value: new THREE.Color(0x8f7ff0) },
    },
  });
}
