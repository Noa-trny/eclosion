import { lightingChunk } from "./chunks/lighting";
import { noiseChunk } from "./chunks/noise";

export const seedVertexShader = /* glsl */ `
uniform float uTime;
uniform float uGlow;
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
void main() {
  // The seed breathes — a heartbeat swell that grows with its glow.
  float pulse = 1.0 + 0.035 * sin(uTime * 2.6) * uGlow;
  vec3 p = position * pulse;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vObjPos = normalize(position);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const seedFragmentShader = /* glsl */ `
${lightingChunk}
${noiseChunk}
uniform float uTime;
uniform float uGlow;
uniform float uGerm;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;

void main() {
  vec3 husk = vec3(0.08, 0.055, 0.04);
  // Cracks open as germination progresses; light pours through.
  float pattern = fbm3(vObjPos * 4.0) * 0.5 + 0.5;
  float crack = smoothstep(uGerm * 1.1 + 0.05, uGerm * 1.1 - 0.15, pattern) * step(0.02, uGerm);
  float pulse = 0.75 + 0.25 * sin(uTime * 2.6);
  vec3 glowColor = vec3(1.0, 0.72, 0.3) * (uGlow * pulse * 2.2);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float rim = fresnel(viewDir, normalize(vNormal), 2.5);
  vec3 col = mix(husk * (0.6 + pattern * 0.5), glowColor, crack);
  col += glowColor * rim * 0.5;
  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  gl_FragColor = vec4(col, 1.0);
}
`;
