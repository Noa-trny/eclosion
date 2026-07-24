import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 3 (0.35–0.47) — clouds close in, rain sweeps the canopy, lightning. */
export function buildStormTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tweenToPalette(tl, "storm", 0.35);
  tl.to(a, { cloudDensity: 1, duration: 0.04, ease: "power1.in" }, 0.345);
  tl.to(a, { fireflyIntensity: 0, duration: 0.03 }, 0.35);
  tl.to(a, { moonIntensity: 0.25, duration: 0.04 }, 0.36);
  // The sky breaks IMMEDIATELY — a fast scroller crosses this act in
  // seconds, the violence cannot wait for its middle.
  tl.to(a, { rainIntensity: 1, duration: 0.045, ease: "power2.in" }, 0.352);
  tl.to(a, { lightningActivity: 1, duration: 0.03 }, 0.35);
  tl.to(uniformProxies.wind, { x: 3.2, z: 1.1, duration: 0.06 }, 0.36);
  // Crescendo shape: build to a violent peak mid-act, then ease off slightly.
  tl.to(uniformProxies.camera, { shake: 0.38, duration: 0.05 }, 0.38);
  tl.to(uniformProxies.camera, { shake: 0.24, duration: 0.03 }, 0.44);
  tl.to(uniformProxies.grade, { lift: -0.02, duration: 0.04 }, 0.38);
  tl.to(uniformProxies.grade, { lift: 0, duration: 0.03 }, 0.47);
}
