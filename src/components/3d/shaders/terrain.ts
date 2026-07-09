import { lightingChunk } from "./chunks/lighting";
import { noiseChunk } from "./chunks/noise";

export const terrainVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const terrainFragmentShader = /* glsl */ `
${lightingChunk}
${noiseChunk}
uniform vec3 uGrassColor;
uniform vec3 uRockColor;
uniform vec3 uSandColor;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform vec3 uCraterPos;
uniform float uLavaGlow;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 n = normalize(vNormal);
  // Procedural detail bump: FBM gradient perturbs the normal so the surface
  // catches light per-pixel — strongest on the volcano's rocky flank.
  float rocky = 0.5 + 2.6 * exp(-distance(vWorldPos.xz, uCraterPos.xz) * 0.014);
  float e = 0.7;
  float h0 = fbm2(vWorldPos.xz * 0.5);
  float hx = fbm2((vWorldPos.xz + vec2(e, 0.0)) * 0.5);
  float hz = fbm2((vWorldPos.xz + vec2(0.0, e)) * 0.5);
  n = normalize(vec3(n.x - (hx - h0) * rocky, n.y, n.z - (hz - h0) * rocky));
  float slope = 1.0 - n.y;
  float detail = fbm2(vWorldPos.xz * 0.3) * 0.5 + 0.5;
  vec3 grass = uGrassColor * (0.75 + detail * 0.5);
  vec3 rock = uRockColor * (0.7 + detail * 0.55);
  vec3 albedo = mix(grass, rock, smoothstep(0.18, 0.5, slope));
  albedo = mix(uSandColor * (0.8 + detail * 0.3), albedo, smoothstep(-1.6, 1.4, vWorldPos.y));
  // Near the crater: basalt charcoal broken by oxidized rust patches.
  float nearCrater = exp(-distance(vWorldPos.xz, uCraterPos.xz) * 0.011);
  vec3 basalt = mix(vec3(0.07, 0.06, 0.055), vec3(0.24, 0.09, 0.05), smoothstep(0.35, 0.75, detail));
  albedo = mix(albedo, basalt * (0.7 + detail * 0.6), smoothstep(0.08, 0.5, nearCrater));

  float light = halfLambert(n, uSunDir) * uSunIntensity;
  vec3 col = albedo * (uAmbientColor * uAmbientIntensity * 3.0 + uSunColor * light * 2.0);

  // Crater glow bleeding onto the volcano flank.
  if (uLavaGlow > 0.001) {
    float d = distance(vWorldPos.xz, uCraterPos.xz);
    float glow = exp(-d * 0.045) * uLavaGlow * (0.8 + 0.2 * sin(uTime * 2.2));
    col += vec3(1.0, 0.32, 0.05) * glow;
  }

  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity);
  gl_FragColor = vec4(col, 1.0);
}
`;
