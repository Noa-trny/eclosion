import type { Tier } from "./quality";

/** Closed-form behaviors evaluated in the vertex shader from (seed, uTime). */
export type BehaviorKind = "fall" | "curl" | "rise" | "drift" | "twinkle" | "vortex";

export type SpawnKind = "box" | "sphere";

export interface ParticlePreset {
  id: string;
  behavior: BehaviorKind;
  counts: Record<Tier, number>;
  /** Base point size in world units (attenuated by distance). */
  size: number;
  colorA: [number, number, number];
  colorB: [number, number, number];
  spawn: { kind: SpawnKind; size: [number, number, number] };
  /** Behavior speed multiplier (fall rate, curl drift, rise rate…). */
  speed: number;
  /** Spatial scale of the noise field for curl/drift behaviors. */
  noiseScale: number;
  additive: boolean;
  opacity: number;
  /** How strongly the shared wind vector shears this system. */
  windInfluence: number;
}
