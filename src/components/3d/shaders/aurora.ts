import { noiseChunk } from "./chunks/noise";

/** Additive ribbon — sky aurora AND underwater light shafts share this. */
export const auroraVertexShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uWave;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += snoise2(vec2(p.x * 0.04 + uTime * 0.06, uv.y * 2.0)) * 4.0 * uWave;
  p.x += snoise2(vec2(uv.y * 3.0, uTime * 0.04)) * 2.0 * uWave;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const auroraFragmentShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;

void main() {
  float band = fbm2(vec2(vUv.x * 5.0 + uTime * 0.05, vUv.y * 1.5)) * 0.5 + 0.5;
  float vertical = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
  float a = band * vertical * uIntensity;
  if (a < 0.004) discard;
  vec3 col = mix(uColorA, uColorB, band);
  gl_FragColor = vec4(col * a, a * 0.55);
}
`;
