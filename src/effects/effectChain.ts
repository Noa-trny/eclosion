/** Data-only description of the per-tier composer chain, keeping the
 *  PostProcessing component itself small. Order matters: distortion first,
 *  then light transport, then grade, then film artifacts, then AA. */
import type { PostFlags } from "@/types/quality";

export interface BloomSettings {
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
}

/** Higher threshold keeps bloom off the midtones (washed-out look); higher
 *  intensity makes true emitters (seed, lava, fireflies, plankton) pop. */
export const BLOOM_SETTINGS: BloomSettings = {
  intensity: 0.95,
  luminanceThreshold: 0.62,
  luminanceSmoothing: 0.18,
};

export const DOF_SETTINGS = {
  focusDistance: 0.02,
  focalLength: 0.035,
  bokehScale: 1.4,
};

export const GOD_RAYS_SETTINGS = {
  samples: 42,
  density: 0.92,
  decay: 0.95,
  weight: 0.4,
  exposure: 0.52,
};

export const VIGNETTE_SETTINGS = { offset: 0.24, darkness: 0.72 };

export const CHROMATIC_OFFSET: [number, number] = [0.0011, 0.0007];

export function describeChain(flags: PostFlags): string {
  const parts = ["bloom"];
  if (flags.dof) parts.push("dof");
  if (flags.godRays) parts.push("godrays");
  if (flags.chromatic) parts.push("chromatic");
  parts.push("ripple", "grade");
  if (flags.grain) parts.push("grain");
  if (flags.speedBlur) parts.push("speedblur");
  parts.push("vignette", flags.antialias);
  return parts.join("+");
}
