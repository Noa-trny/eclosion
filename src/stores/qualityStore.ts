import { create } from "zustand";
import type { Tier } from "@/types/quality";
import { DPR_STEPS, QUALITY_PRESETS } from "@/config/quality";
import { useAppStore } from "@/stores/appStore";

const TIER_ORDER: Tier[] = ["low", "medium", "high"];

interface QualityState {
  tier: Tier;
  dpr: number;
  /** Extra multiplier the editor can apply on top of the tier's scale. */
  editorParticleScale: number;
  promotions: number;
  setTier: (tier: Tier) => void;
  demote: () => void;
  promote: () => void;
  setEditorParticleScale: (v: number) => void;
}

function dprFor(tier: Tier): number {
  const cap = QUALITY_PRESETS[tier].dprMax;
  const device = typeof window === "undefined" ? 1 : window.devicePixelRatio;
  return Math.min(cap, device);
}

export const useQualityStore = create<QualityState>((set) => ({
  tier: "medium",
  dpr: 1.5,
  editorParticleScale: 1,
  promotions: 0,
  setTier: (tier) => set({ tier, dpr: dprFor(tier) }),
  demote: () =>
    set((s) => {
      // First walk the DPR ladder down, then drop a whole tier (floor: low).
      const idx = DPR_STEPS.findIndex((d) => d < s.dpr - 0.01);
      if (idx >= 0) {
        const next = DPR_STEPS[idx];
        if (next !== undefined) return { dpr: next };
      }
      const tierIdx = TIER_ORDER.indexOf(s.tier);
      if (tierIdx > 0) {
        const nextTier = TIER_ORDER[tierIdx - 1];
        if (nextTier) return { tier: nextTier, dpr: dprFor(nextTier) };
      }
      return {};
    }),
  promote: () =>
    set((s) => {
      // Cautious: at most one promotion per session.
      if (s.promotions >= 1) return {};
      const tierIdx = TIER_ORDER.indexOf(s.tier);
      const nextTier = TIER_ORDER[tierIdx + 1];
      if (!nextTier) return {};
      return { tier: nextTier, dpr: dprFor(nextTier), promotions: s.promotions + 1 };
    }),
  setEditorParticleScale: (v) => set({ editorParticleScale: v }),
}));

/** Effective particle count for a preset at the current quality.
 *  prefers-reduced-motion cuts counts to 30% of the low-tier scale. */
export function particleCount(highCount: number): number {
  const s = useQualityStore.getState();
  const reduced = useAppStore.getState().reducedMotion;
  const scale = reduced
    ? QUALITY_PRESETS.low.particleScale * 0.3
    : QUALITY_PRESETS[s.tier].particleScale * s.editorParticleScale;
  return Math.floor(highCount * scale);
}
