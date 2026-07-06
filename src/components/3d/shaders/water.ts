import { gerstnerChunk } from "./chunks/gerstner";
import { lightingChunk } from "./chunks/lighting";
import { noiseChunk } from "./chunks/noise";

export const waterVertexShader = /* glsl */ `
${gerstnerChunk}
uniform float uTime;
uniform float uWaveHeight;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vCrest;

void main() {
  vec3 p = position;
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);
  vec3 worldP = (modelMatrix * vec4(p, 1.0)).xyz;
  vec3 d = vec3(0.0);
  d += gerstnerWave(vec2(1.0, 0.3), 0.22 * uWaveHeight, 24.0, 1.0, worldP, uTime, tangent, binormal);
  d += gerstnerWave(vec2(-0.7, 1.0), 0.2 * uWaveHeight, 13.0, 1.1, worldP, uTime, tangent, binormal);
  d += gerstnerWave(vec2(0.4, -0.9), 0.16 * uWaveHeight, 7.0, 0.9, worldP, uTime, tangent, binormal);
  d += gerstnerWave(vec2(-1.0, -0.4), 0.14 * uWaveHeight, 3.6, 1.3, worldP, uTime, tangent, binormal);
  p += d;
  vCrest = d.y;
  vNormal = normalize(cross(binormal, tangent));
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const waterFragmentShader = /* glsl */ `
${lightingChunk}
${noiseChunk}
uniform float uTime;
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vCrest;

void main() {
  vec3 n = normalize(vNormal);
  n.xz += vec2(
    snoise2(vWorldPos.xz * 1.4 + uTime * 0.35),
    snoise2(vWorldPos.zx * 1.7 - uTime * 0.3)
  ) * 0.08;
  n = normalize(n);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float f = fresnel(viewDir, n, 3.0);
  vec3 reflDir = reflect(-viewDir, n);
  vec3 skyCol = mix(uSkyBottom, uSkyTop, clamp(reflDir.y * 0.5 + 0.5, 0.0, 1.0)) * 1.6;
  vec3 depthCol = mix(uDeepColor, uShallowColor, clamp(vCrest * 0.8 + 0.4, 0.0, 1.0));
  vec3 col = mix(depthCol, skyCol, f * 0.85);
  // Tight sun spec + broad glitter band.
  float sunDot = max(dot(reflDir, normalize(uSunDir)), 0.0);
  float spec = pow(sunDot, 200.0) * uSunIntensity * 4.0 + pow(sunDot, 40.0) * uSunIntensity * 0.6;
  col += uSunColor * spec;
  // Crest foam: main band + high-frequency micro-lace.
  float foam = smoothstep(0.32, 0.72, vCrest + snoise2(vWorldPos.xz * 3.0 + uTime * 0.5) * 0.18);
  foam += smoothstep(0.6, 0.9, snoise2(vWorldPos.xz * 9.0 - uTime * 0.8)) * foam;
  col = mix(col, vec3(0.85, 0.94, 1.0), clamp(foam, 0.0, 1.0) * 0.55);
  // Cheap subsurface glow through the crests.
  col += uShallowColor * vCrest * 0.35 * uSunIntensity;
  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  gl_FragColor = vec4(col, 0.94);
}
`;
