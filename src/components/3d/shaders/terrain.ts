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
  float slope = 1.0 - n.y;
  float detail = fbm2(vWorldPos.xz * 0.3) * 0.5 + 0.5;
  vec3 grass = uGrassColor * (0.75 + detail * 0.5);
  vec3 rock = uRockColor * (0.7 + detail * 0.55);
  vec3 albedo = mix(grass, rock, smoothstep(0.18, 0.5, slope));
  albedo = mix(uSandColor * (0.8 + detail * 0.3), albedo, smoothstep(-1.6, 1.4, vWorldPos.y));

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
