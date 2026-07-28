import { noiseChunk } from "./chunks/noise";

/** Additive ribbon — sky aurora AND underwater light shafts share this. */
export const auroraVertexShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uWave;
varying vec2 vUv;
varying float vFacing;
varying float vDepth;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += snoise2(vec2(p.x * 0.04 + uTime * 0.06, uv.y * 2.0)) * 4.0 * uWave;
  p.x += snoise2(vec2(uv.y * 3.0, uTime * 0.04)) * 2.0 * uWave;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // How squarely the camera faces the ribbon, and how close it stands —
  // the fragment fades on both, so the plane never betrays that it IS one.
  vec3 n = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
  vFacing = abs(dot(n, normalize(-mv.xyz)));
  vDepth = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const auroraFragmentShader = /* glsl */ `
${noiseChunk}
uniform float uTime;
uniform float uIntensity;
uniform float uViewFade;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
varying float vFacing;
varying float vDepth;

void main() {
  float band = fbm2(vec2(vUv.x * 5.0 + uTime * 0.05, vUv.y * 1.5)) * 0.5 + 0.5;
  float vertical = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
  // Soft side edges everywhere: a ribbon's hard vertical border reads as a
  // bright line the moment it crosses the frame.
  float horizontal = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
  // View-dependent fades, opt-in per material (uViewFade): the ocean camera
  // swims THROUGH its cathedral, where an edge-on ribbon reads as a slab and
  // a plane crossing the lens paints a diagonal wall — but the forest's
  // corridor curtains are MEANT to be seen at grazing angles, so they keep
  // their full presence at uViewFade = 0.
  float grazing = mix(1.0, smoothstep(0.06, 0.35, vFacing), uViewFade);
  float near = mix(1.0, smoothstep(2.5, 9.0, vDepth), uViewFade);
  float a = band * vertical * horizontal * grazing * near * uIntensity;
  if (a < 0.004) discard;
  vec3 col = mix(uColorA, uColorB, band);
  gl_FragColor = vec4(col * a, a * 0.55);
}
`;
