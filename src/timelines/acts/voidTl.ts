import type gsap from "gsap";
import { uniformProxies } from "../uniformProxies";

/** Act 0 (0–0.08) — darkness, dust, and the promise already visible: a
 *  distant spark on the horizon that grows as you approach. */
export function buildVoidTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tl.set(a, { dustIntensity: 1 }, 0);
  // The seed's ember is seen from the very first scroll — "une promesse".
  tl.to(a, { seedGlow: 0.3, duration: 0.03, ease: "power1.in" }, 0.015);
  tl.to(a, { seedGlow: 0.45, duration: 0.03 }, 0.05);
}
