import type gsap from "gsap";
import { uniformProxies } from "../uniformProxies";

/** Act 0 (0–0.08) — darkness, dust, a first faint pulse of anticipation. */
export function buildVoidTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tl.set(a, { dustIntensity: 1 }, 0);
  // A hint of the seed's glow before its act begins.
  tl.to(a, { seedGlow: 0.15, duration: 0.03, ease: "power2.in" }, 0.05);
}
