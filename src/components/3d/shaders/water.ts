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
varying vec2 vUv;

void main() {
  vUv = uv;
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
uniform float uWaterLevel;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vCrest;
varying vec2 vUv;

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
  // From BELOW at grazing incidence every bright term of this shader stacks
  // into one pale stripe across the whole dive (mirror + foam + subsurface
  // glow + spec) — hiding the sheet proved it was the stripe's only source.
  // The gate is the CAMERA's side of the surface, not gl_FrontFacing: at
  // grazing angles the diver sees the tilted FRONT slopes of far Gerstner
  // crests, so face orientation alone lets the stripe through. Underwater,
  // distant water is dark water: a whisper of each term below, the full
  // voice above. Smooth over ~1 unit so the pierce never pops (the dive's
  // fullscreen ripple covers the crossing anyway).
  float above = smoothstep(uWaterLevel - 0.6, uWaterLevel + 0.6, cameraPosition.y);
  float dist = length(cameraPosition - vWorldPos);
  // The whisper must NOT swallow the emergence. Distance cannot separate
  // the two looks (stripe and exit ceiling share the same range) -- the
  // GAZE does: the stripe is the sheet seen at grazing incidence
  // (viewDir.y ~ 0), the emergence is the sheet you look UP at. Restore the
  // voice with the upward inclination of the line of sight.
  float lookUp = smoothstep(0.35, 0.6, -viewDir.y);
  float voice = max(above, lookUp * 0.9);
  float mirror = mix(0.12, 0.85, voice);
  // depthCol is unlit — from below its shallow teal reads as emission and was
  // the stripe's brightest term. Sink it toward the deep color underwater.
  depthCol = mix(uDeepColor, depthCol, mix(0.2, 1.0, voice));
  vec3 col = mix(depthCol, skyCol, f * mirror);
  // Tight sun spec + broad glitter band.
  float sunDot = max(dot(reflDir, normalize(uSunDir)), 0.0);
  float spec = pow(sunDot, 200.0) * uSunIntensity * 4.0 + pow(sunDot, 40.0) * uSunIntensity * 0.6;
  col += uSunColor * spec * mix(0.25, 1.0, voice);
  // Crest foam: main band + high-frequency micro-lace.
  float foam = smoothstep(0.44, 0.82, vCrest + snoise2(vWorldPos.xz * 3.0 + uTime * 0.5) * 0.16);
  foam += smoothstep(0.6, 0.9, snoise2(vWorldPos.xz * 9.0 - uTime * 0.8)) * foam;
  float foamStrength = mix(0.04, 0.42, voice);
  col = mix(col, vec3(0.85, 0.94, 1.0), clamp(foam, 0.0, 1.0) * foamStrength);
  // Cheap subsurface glow through the crests.
  col += uShallowColor * vCrest * 0.35 * uSunIntensity * mix(0.25, 1.0, voice);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  // The sheet must never END in view: its border tears a jagged bright line
  // where the drowned-sun glow stops being filtered. Dissolve the outer rim.
  float rim = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x)
            * smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
  gl_FragColor = vec4(col, 0.94 * rim);
}
`;
