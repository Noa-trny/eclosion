import { noiseChunk } from "./chunks/noise";

/** Camera-facing puff quads built from aCenter/aCorner attributes — each puff
 *  loops a rise cycle as a pure function of (aSeed, uTime). */
export const smokeVertexShader = /* glsl */ `
uniform float uTime;
uniform float uRise;
uniform float uScale;
uniform vec3 uWind;
attribute vec3 aCenter;
attribute vec2 aCorner;
attribute vec2 aSeed;
varying vec2 vUv;
varying float vLife;
varying float vSeed;

void main() {
  float life = fract(uTime * 0.05 * (0.5 + aSeed.y * 0.9) + aSeed.x);
  vec3 center = aCenter;
  center.y += life * uRise;
  center.xz += uWind.xz * life * 3.0 + vec2(sin(life * 9.0 + aSeed.x * 6.2832), cos(life * 7.0 + aSeed.y * 6.2832)) * life * 2.0;
  float scale = mix(2.0, 8.5, life) * uScale;
  vec4 worldCenter = modelMatrix * vec4(center, 1.0);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 pos = worldCenter.xyz + (right * aCorner.x + up * aCorner.y) * scale;
  vUv = aCorner * 0.5 + 0.5;
  vLife = life;
  vSeed = aSeed.x;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

export const smokeFragmentShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uDensity;
uniform vec3 uColor;
varying vec2 vUv;
varying float vLife;
varying float vSeed;

void main() {
  vec2 uv = vUv - 0.5;
  float radial = smoothstep(0.5, 0.12, length(uv));
  float texture_ = fbm2(vUv * 3.5 + vSeed * 19.0 + vec2(0.0, uTime * 0.04)) * 0.5 + 0.5;
  float a = radial * texture_ * uDensity * (1.0 - vLife) * smoothstep(0.0, 0.12, vLife) * 0.55;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor * (0.6 + texture_ * 0.5), a);
}
`;
