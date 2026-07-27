import { create } from "zustand";
import { getActState } from "@/config/acts";

interface ProgressState {
  progress: number;
  /** ScrollTrigger velocity (px/s) — drives the speed-blur effect. */
  velocity: number;
  actIndex: number;
  actLocal: number;
}

/** Written transiently on every scroll tick. Per-frame consumers must read via
 *  getState() inside useFrame; React components may only subscribe to actIndex
 *  (or other rarely-changing slices) with a primitive selector. */
export const useProgressStore = create<ProgressState>(() => ({
  progress: 0,
  velocity: 0,
  actIndex: 0,
  actLocal: 0,
}));

/** Velocity is only WRITTEN on real scroll ticks — without decay, the last
 *  value freezes after a programmatic jump and the speed blur (and the wind
 *  gust) stay stuck on. Called every ticker frame; real updates overwrite. */
export function decayVelocity(dt: number): void {
  const v = useProgressStore.getState().velocity;
  if (Math.abs(v) < 0.5) {
    if (v !== 0) useProgressStore.setState({ velocity: 0 });
    return;
  }
  useProgressStore.setState({ velocity: v * Math.exp(-5 * dt) });
}

export function writeProgress(progress: number, velocity: number): void {
  const { index, local } = getActState(progress);
  useProgressStore.setState({ progress, velocity, actIndex: index, actLocal: local });
}
