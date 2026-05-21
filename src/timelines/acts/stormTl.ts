import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 3 (0.35–0.47) — clouds close in, rain sweeps the canopy, lightning. */
export function buildStormTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tweenToPalette(tl, "storm", 0.35);
  tl.to(a, { cloudDensity: 1, duration: 0.05, ease: "power1.in" }, 0.35);
  tl.to(a, { fireflyIntensity: 0, duration: 0.03 }, 0.35);
  tl.to(a, { moonIntensity: 0.25, duration: 0.04 }, 0.36);
  tl.to(a, { rainIntensity: 1, duration: 0.06, ease: "power2.in" }, 0.37);
  tl.to(a, { lightningActivity: 1, duration: 0.05 }, 0.4);
  tl.to(uniformProxies.wind, { x: 3.2, z: 1.1, duration: 0.06 }, 0.36);
  tl.to(uniformProxies.camera, { shake: 0.3, duration: 0.06 }, 0.38);
}
