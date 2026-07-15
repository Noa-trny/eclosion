import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 2 (0.20–0.35) — trees rise, the moon climbs, fireflies wake. */
export function buildForestTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  // Slightly early + slow: the warm seed light cools into teal night while
  // the camera is still gliding away from the mound.
  tweenToPalette(tl, "forest", 0.19, 0.06);
  tl.to(a, { treeGrowth: 1, duration: 0.1, ease: "power1.inOut" }, 0.2);
  tl.to(a, { moonIntensity: 1, duration: 0.06, ease: "power1.out" }, 0.22);
  tl.to(a, { fireflyIntensity: 1, duration: 0.06, ease: "power2.in" }, 0.24);
  tl.to(a, { dustIntensity: 0.3, duration: 0.05 }, 0.21);
  // The storm announces itself: rare distant flashes over the canopy before
  // the act even begins.
  tl.to(a, { lightningActivity: 0.12, duration: 0.015 }, 0.315);
}
