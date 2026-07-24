import { useAppStore } from "@/stores/appStore";
import { useProgressStore } from "@/stores/progressStore";

/** Records WHERE the visitor's time went: the film divided into buckets, each
 *  accumulating dwell seconds. At the end this trace becomes their personal
 *  constellation — no two crossings draw the same sky. */
const BUCKETS = 48;
const dwell = new Float32Array(BUCKETS);
let sampling = false;

export function startJourneyTrace(): void {
  if (sampling) return;
  sampling = true;
  let last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 1);
    last = now;
    const app = useAppStore.getState();
    if (!app.started || app.mode !== "scroll" || app.cinema) return;
    const progress = useProgressStore.getState().progress;
    // Parking on the start or the end card is waiting, not travelling.
    if (progress <= 0.002 || progress >= 0.99) return;
    const bucket = Math.min(BUCKETS - 1, Math.floor(progress * BUCKETS));
    dwell[bucket] = (dwell[bucket] ?? 0) + dt;
  }, 250);
}

export interface JourneyStar {
  /** Normalized journey position (0..1) — the star's x. */
  x: number;
  /** Deterministic scatter (0..1) — the star's y. */
  y: number;
  /** Dwell weight (0.35..1) — the star's size and brightness. */
  w: number;
}

function scatter(i: number): number {
  const s = Math.sin((i + 1) * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/** The moments that held you, as stars — ordered along the journey, sized by
 *  how long you stayed. Returns [] until the trace is expressive enough. */
export function getConstellation(max = 12): JourneyStar[] {
  const entries = Array.from(dwell, (t, i) => ({ t, i })).filter((e) => e.t > 0.5);
  if (entries.length < 4) return [];
  entries.sort((a, b) => b.t - a.t);
  const top = entries.slice(0, max).sort((a, b) => a.i - b.i);
  const peak = Math.max(...top.map((e) => e.t));
  return top.map(({ t, i }) => ({
    x: (i + 0.5) / BUCKETS,
    y: 0.16 + scatter(i) * 0.68,
    w: 0.35 + 0.65 * Math.sqrt(t / peak),
  }));
}
