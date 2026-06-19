import { noiseChunk } from "./chunks/noise";

export const cloudsVertexShader = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/** Cheap raymarch (8 steps) through an FBM density slab under the plane. */
export const cloudsFragmentShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uDensity;
uniform float uFlash;
uniform vec3 uWind;
uniform vec3 uFogColor;
varying vec3 vWorldPos;

const int STEPS = 8;

void main() {
  if (uDensity < 0.005) discard;
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorldPos - cameraPosition);
  float top = vWorldPos.y;
  float base = top - 14.0;
  // Entry/exit of the slab along the view ray.
  float tTop = (top - ro.y) / max(abs(rd.y), 0.02) * sign(rd.y) * sign(top - ro.y);
  float t0 = max(0.0, min(tTop, 400.0));
  float stepLen = 14.0 / float(STEPS);
  vec3 p = ro + rd * t0;
  float acc = 0.0;
  float glow = 0.0;
  for (int i = 0; i < STEPS; i++) {
    p += rd * stepLen * 2.2;
    float d = fbm3(vec3(p.x * 0.02, p.y * 0.05, p.z * 0.02) + vec3(uWind.x, 0.0, uWind.z) * uTime * 0.01);
    d = clamp(d * 0.5 + 0.5 - (1.0 - uDensity) * 0.85, 0.0, 1.0);
    acc += d * (1.0 - acc) * 0.32;
    glow += d * clamp((p.y - base) / 14.0, 0.0, 1.0) * 0.1;
  }
  float a = clamp(acc, 0.0, 1.0) * uDensity;
  if (a < 0.01) discard;
  vec3 col = mix(uFogColor * 0.9, vec3(0.62, 0.64, 0.72), glow * 1.4);
  col += vec3(0.9, 0.92, 1.0) * uFlash * (0.6 + glow * 1.2);
  gl_FragColor = vec4(col, a * 0.85);
}
`;
