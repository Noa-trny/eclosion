import { noiseChunk } from "../chunks/noise";
import { curlChunk } from "../chunks/curl";

/** Vertex scaffold for every particle system: the behavior chunk (injected at
 *  %BEHAVIOR%) rewrites `pos`/`alpha` as a closed-form function of the seed and
 *  uTime — stateless simulation, no FBO, nothing to resume or upload. */
export function buildParticleVertexShader(behaviorChunk: string): string {
  return /* glsl */ `
${noiseChunk}
${curlChunk}
uniform float uTime;
uniform float uIntensity;
uniform float uSize;
uniform float uSpeed;
uniform float uNoiseScale;
uniform vec3 uWind;
uniform float uWindInfluence;
uniform vec3 uSpawnSize;
uniform float uOpacity;
uniform float uDpr;
uniform vec3 uColorA;
uniform vec3 uColorB;
attribute vec4 aSeed;
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec3 pos = position;
  float alpha = 1.0;
${behaviorChunk}
  // Intensity culls particles smoothly: seeds above uIntensity fade out.
  alpha *= smoothstep(uIntensity + 0.08, uIntensity - 0.02, aSeed.x);
  vColor = mix(uColorA, uColorB, aSeed.y);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float dist = max(-mv.z, 1.0);
  gl_PointSize = min(uSize * uDpr * 340.0 / dist, 60.0 * uDpr);
  vAlpha = alpha * uOpacity;
  gl_Position = projectionMatrix * mv;
}
`;
}
