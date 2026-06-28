import type { BehaviorKind } from "@/types/particles";

/** Each chunk runs inside the base vertex main() with `pos`, `alpha`, the
 *  spawn `position` attribute and all base uniforms in scope. Every motion is
 *  a pure function of (aSeed, uTime) — wrap-around loops, no state. */
const BEHAVIORS: Record<BehaviorKind, string> = {
  fall: /* glsl */ `
  float rate = uSpeed * (0.5 + aSeed.w);
  pos.y = mod(position.y - uTime * rate + uSpawnSize.y * 0.5, uSpawnSize.y) - uSpawnSize.y * 0.5;
  pos.x = mod(position.x + uTime * uWind.x * uWindInfluence + uSpawnSize.x * 0.5, uSpawnSize.x) - uSpawnSize.x * 0.5;
  pos.z = mod(position.z + uTime * uWind.z * uWindInfluence + uSpawnSize.z * 0.5, uSpawnSize.z) - uSpawnSize.z * 0.5;
  pos.x += sin(uTime * 1.7 + aSeed.z * 6.2832) * uNoiseScale;
`,
  curl: /* glsl */ `
  vec3 flow = curlNoise(position * uNoiseScale + uTime * 0.05 * uSpeed + aSeed.xyz * 4.0);
  pos = position + flow * (2.5 + aSeed.w * 4.0);
  float pulse = 0.5 + 0.5 * sin(uTime * (1.0 + aSeed.w * 2.2) + aSeed.z * 6.2832);
  alpha *= 0.25 + 0.75 * pulse * pulse;
`,
  rise: /* glsl */ `
  float rate = uSpeed * (0.4 + aSeed.w * 0.9);
  float life = fract(uTime * rate / uSpawnSize.y + aSeed.z);
  pos.y = -uSpawnSize.y * 0.5 + life * uSpawnSize.y;
  vec3 flutter = curlNoise(position * uNoiseScale + uTime * 0.12);
  pos.xz = position.xz + flutter.xz * (1.0 + life * 4.0) + uWind.xz * uWindInfluence * life * 5.0;
  alpha *= (1.0 - life) * (0.45 + 0.55 * (0.5 + 0.5 * sin(aSeed.z * 6.2832 + uTime * 3.0)));
`,
  drift: /* glsl */ `
  vec3 flow = curlNoise(position * uNoiseScale + uTime * 0.02 * uSpeed);
  pos = position + flow * 2.0 + uWind * uWindInfluence * sin(uTime * 0.1 + aSeed.z * 6.2832);
  alpha *= 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.4 + aSeed.w * 0.9) + aSeed.z * 6.2832));
`,
  twinkle: /* glsl */ `
  float tw = 0.5 + 0.5 * sin(uTime * (0.5 + aSeed.w * 1.8) + aSeed.z * 6.2832);
  alpha *= 0.3 + 0.7 * tw * tw * tw;
`,
  // The finale: petals of light spiralling up a narrowing helix toward the
  // sun — radius closes and speed rises as each particle climbs.
  vortex: /* glsl */ `
  float life = fract(uTime * uSpeed * 0.045 * (0.55 + aSeed.w * 0.9) + aSeed.z);
  float angle = aSeed.x * 6.2832 + uTime * (0.35 + aSeed.w * 0.55) + life * 4.5;
  float radius = mix(uSpawnSize.x * 0.55, uSpawnSize.x * 0.05, life * life) * (0.45 + aSeed.y * 0.55);
  pos = vec3(cos(angle) * radius, -uSpawnSize.y * 0.5 + life * uSpawnSize.y, sin(angle) * radius);
  pos.xz += curlNoise(vec3(aSeed.xy * 8.0, life * 3.0)).xz * 1.5;
  alpha *= smoothstep(0.0, 0.12, life) * smoothstep(1.0, 0.8, life) * (0.6 + 0.4 * sin(uTime * 3.0 + aSeed.z * 6.2832));
`,
};

export function behaviorChunk(kind: BehaviorKind): string {
  return BEHAVIORS[kind];
}
