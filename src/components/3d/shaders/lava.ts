import { lightingChunk } from "./chunks/lighting";
import { noiseChunk } from "./chunks/noise";

export const lavaVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const lavaFragmentShader = /* glsl */ `
${lightingChunk}
${noiseChunk}
uniform float uTime;
uniform float uFlow;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  // uv.y runs along the flow direction — the FBM scrolls downhill.
  vec2 flowUv = vUv * vec2(2.2, 6.0) + vec2(0.0, -uTime * 0.16 * max(uFlow, 0.05));
  float flow = fbm2(flowUv) * 0.5 + 0.5;
  float crust = fbm2(vUv * vec2(9.0, 20.0) + vec2(0.0, -uTime * 0.11)) * 0.5 + 0.5;
  float heat = clamp(flow * (0.55 + 0.65 * uFlow), 0.0, 1.0);

  vec3 col = mix(vec3(0.03, 0.02, 0.02), vec3(0.65, 0.07, 0.01), smoothstep(0.12, 0.42, heat));
  col = mix(col, vec3(1.0, 0.42, 0.04), smoothstep(0.42, 0.72, heat * (0.75 + 0.5 * crust)));
  col = mix(col, vec3(1.0, 0.9, 0.55), smoothstep(0.78, 0.96, heat * crust));
  col *= 0.5 + uFlow * 1.7;

  float dist = length(cameraPosition - vWorldPos);
  col = applyFogExp2(col, dist, uFogColor, uFogDensity * 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`;
