import { noiseChunk } from "./chunks/noise";

export const cloudsVertexShader = /* glsl */ `
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/** Volumetric slab march: Beer's law transmittance, one light sample toward
 *  the sun per step (silver linings, sunrise-lit bellies), detail erosion,
 *  blue-noise-ish jitter against banding. Steps scale with quality tier. */
export const cloudsFragmentShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uDensity;
uniform float uFlash;
uniform float uSteps;
uniform float uWarm;
uniform vec3 uWind;
uniform vec3 uFogColor;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
varying vec3 vWorldPos;
varying vec2 vUv;

const int MAX_STEPS = 30;
const float SLAB = 16.0;

// Two-octave base: the march runs this dozens of times per pixel — every
// snoise call counts. The full 4-octave fbm was the storm's frame-killer.
float cloudBase(vec3 p, float topY) {
  float hNorm = clamp((topY - p.y) / SLAB, 0.0, 1.0);
  float heightShape = smoothstep(0.0, 0.22, hNorm) * smoothstep(1.0, 0.5, hNorm);
  vec3 q = p * 0.018 + vec3(uWind.x, 0.0, uWind.z) * uTime * 0.012;
  float base = snoise3(q) * 0.62 + snoise3(q * 2.3) * 0.3 + 0.5;
  float d = base - (1.0 - uDensity) * 0.72;
  return clamp(d * 1.4, 0.0, 1.0) * heightShape;
}

// Full density (base + erosion detail) — primary samples only.
float cloudDensity(vec3 p, float topY) {
  float d = cloudBase(p, topY);
  if (d < 0.01) return d;
  vec3 q = p * 0.018 + vec3(uWind.x, 0.0, uWind.z) * uTime * 0.012;
  float detail = snoise3(q * 3.9 + vec3(0.0, uTime * 0.02, 0.0)) * 0.5 + 0.5;
  return clamp(d - (1.0 - detail) * 0.34, 0.0, 1.0);
}

void main() {
  if (uDensity < 0.005 || uSteps < 1.0) discard;
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorldPos - cameraPosition);
  // Grazing rays fade to nothing at the end anyway (the horizon dissolve) —
  // refuse them BEFORE paying for the march, and give the ones that barely
  // survive a shorter march. This is where the slab's cost hid.
  float grazing = smoothstep(0.015, 0.09, abs(rd.y));
  if (grazing < 0.002) discard;
  float top = vWorldPos.y;
  float base = top - SLAB;
  // Slab entry along the ray (camera may be under, inside, or level with it).
  float t0 = 0.0;
  if (ro.y < base && rd.y > 0.02) t0 = (base - ro.y) / rd.y;
  else if (ro.y > top && rd.y < -0.02) t0 = (top - ro.y) / rd.y;
  else if (ro.y > top || ro.y < base) discard;
  t0 = clamp(t0, 0.0, 600.0);

  float stepLen = (SLAB * 2.2) / uSteps;
  float jitter = hash21(gl_FragCoord.xy + fract(uTime) * 61.0);
  vec3 p = ro + rd * (t0 + jitter * stepLen);
  vec3 sun = normalize(uSunDir);

  float T = 1.0;
  vec3 acc = vec3(0.0);
  int steps = int(uSteps * mix(0.4, 1.0, grazing));
  float lit = 0.5;
  bool litFresh = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= steps || T < 0.03) break;
    p += rd * stepLen;
    float d = cloudDensity(p, top);
    if (d > 0.012) {
      // One occlusion tap toward the sun: bright rims against DARK bellies —
      // the contrast IS the volumetric read. Cheap base only, refreshed every
      // OTHER lit step — lighting varies far slower than density.
      if (!litFresh || (i & 1) == 0) {
        lit = exp(-cloudBase(p + sun * 6.0, top) * 4.5);
        litFresh = true;
      }
      vec3 col = mix(uFogColor * 0.35, vec3(0.82, 0.85, 0.93), lit * lit);
      col = mix(col, uSunColor * 1.6, lit * lit * uWarm);
      col += vec3(0.9, 0.92, 1.0) * uFlash * (0.35 + lit);
      float a = d * stepLen * 0.17;
      acc += col * a * T;
      T *= exp(-d * stepLen * 0.21);
    }
  }
  float alpha = (1.0 - T) * clamp(uDensity * 1.7, 0.0, 1.0);
  // The slab is finite: seen edge-on it saturates and cuts to a dead-straight
  // horizon-wide line at the geometry's border. Dissolve toward the plane's
  // UV edges, and melt grazing rays into the sky before they reach it.
  float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x)
             * smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.84, vUv.y);
  alpha *= edge * grazing;
  if (alpha < 0.012) discard;
  gl_FragColor = vec4(acc / max(1.0 - T, 0.001), alpha * 0.92);
}
`;
