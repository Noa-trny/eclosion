export type Tier = "low" | "medium" | "high";

export type AntialiasMode = "smaa" | "fxaa" | "none";

export interface PostFlags {
  bloom: boolean;
  dof: boolean;
  godRays: boolean;
  ssao: boolean;
  chromatic: boolean;
  grain: boolean;
  speedBlur: boolean;
  antialias: AntialiasMode;
}

export interface QualityPreset {
  /** Hard cap on device pixel ratio for this tier. */
  dprMax: number;
  /** Multiplier applied to every particle preset count. */
  particleScale: number;
  post: PostFlags;
  /** Instanced tree count for the forest act. */
  treeCount: number;
  /** Boids agent count multiplier. */
  boidScale: number;
}
