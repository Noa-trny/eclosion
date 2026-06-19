import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 1 (0.08–0.20) — the seed ignites, cracks open, roots reach down. */
export function buildSeedTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tweenToPalette(tl, "seed", 0.08);
  // Rack focus onto the seed for the push-in, release toward the forest.
  tl.to(uniformProxies.camera, { focus: 0.008, duration: 0.04 }, 0.09);
  tl.to(uniformProxies.camera, { focus: 0.02, duration: 0.04 }, 0.17);
  tl.to(a, { seedGlow: 1, duration: 0.04, ease: "power2.out" }, 0.08);
  tl.to(a, { rootsGrowth: 1, duration: 0.08, ease: "power1.inOut" }, 0.11);
  tl.to(a, { germination: 1, duration: 0.05, ease: "power2.inOut" }, 0.13);
}
