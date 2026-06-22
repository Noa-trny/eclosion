import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 5 (0.62–0.76) — surfacing into heat: lava, embers, a rumbling flank. */
export function buildVolcanoTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  // Emerging from the water — second ripple, underwater grade releases.
  tl.to(uniformProxies.transition, { ripple: 0.8, duration: 0.01, ease: "power2.in" }, 0.618);
  tl.to(uniformProxies.transition, { ripple: 0, duration: 0.016, ease: "power2.out" }, 0.63);
  tl.to(uniformProxies.grade, { underwater: 0, duration: 0.018 }, 0.62);
  // A last gasp of bubbles as the camera breaks the surface.
  tl.to(uniformProxies.acts, { bubbleBurst: 0.6, duration: 0.008 }, 0.615);
  tl.to(uniformProxies.acts, { bubbleBurst: 0, duration: 0.015 }, 0.628);
  tweenToPalette(tl, "volcano", 0.625);
  tl.to(a, { underwaterLight: 0, planktonGlow: 0, fishActivity: 0, duration: 0.03 }, 0.62);

  tl.to(a, { lavaFlow: 1, duration: 0.06, ease: "power1.in" }, 0.64);
  tl.to(a, { smokeDensity: 1, duration: 0.08 }, 0.64);
  tl.to(a, { emberIntensity: 1, duration: 0.07, ease: "power2.in" }, 0.65);
  tl.to(a, { snowIntensity: 0.5, duration: 0.05 }, 0.66);
  tl.to(uniformProxies.camera, { shake: 0.45, duration: 0.05 }, 0.66);
  tl.to(uniformProxies.camera, { shake: 0.15, duration: 0.05 }, 0.72);
  tl.to(uniformProxies.wind, { x: 1.4, y: 0.8, duration: 0.05 }, 0.64);
  // Ash starts falling before the bloom act clears it.
  tl.to(a, { ashFade: 1, duration: 0.04 }, 0.72);
}
