import type { QualityPreset, Tier } from "@/types/quality";

export const QUALITY_PRESETS: Record<Tier, QualityPreset> = {
  low: {
    dprMax: 1,
    particleScale: 0.12,
    treeCount: 90,
    boidScale: 0.4,
    post: {
      bloom: true,
      dof: false,
      godRays: false,
      ssao: false,
      chromatic: false,
      grain: true,
      speedBlur: false,
      antialias: "none",
    },
  },
  medium: {
    // 2, not 1.5: modern phones land here (mobile caps the tier) and a 3x
    // screen at half res reads pixelated; the monitor demotes weak devices.
    dprMax: 2,
    particleScale: 0.4,
    treeCount: 220,
    boidScale: 0.7,
    post: {
      bloom: true,
      dof: false,
      godRays: false,
      ssao: false,
      chromatic: true,
      grain: true,
      speedBlur: true,
      antialias: "fxaa",
    },
  },
  high: {
    dprMax: 2,
    particleScale: 1,
    treeCount: 420,
    boidScale: 1,
    post: {
      bloom: true,
      dof: true,
      godRays: true,
      ssao: false,
      chromatic: true,
      grain: true,
      speedBlur: true,
      antialias: "smaa",
    },
  },
};

/** DPR demotion ladder walked by the PerformanceMonitor on sustained low fps. */
export const DPR_STEPS = [2, 1.5, 1.25, 1, 0.75] as const;
