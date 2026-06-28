import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 4 (0.47–0.62) — the dive at 0.50 is the signature beat: a ripple
 *  distortion, the grade flips underwater, bioluminescence takes over. */
export function buildOceanTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tweenToPalette(tl, "ocean", 0.47);
  tl.to(a, { rainIntensity: 0, lightningActivity: 0, duration: 0.03 }, 0.47);
  tl.to(a, { cloudDensity: 0.3, duration: 0.05 }, 0.47);
  tl.to(uniformProxies.wind, { x: 0.6, z: 0.2, duration: 0.05 }, 0.47);
  tl.to(uniformProxies.camera, { shake: 0.06, duration: 0.04 }, 0.47);
  tl.to(a, { waveHeight: 1.3, duration: 0.03 }, 0.47);

  // The dive.
  tl.to(uniformProxies.transition, { ripple: 1, duration: 0.012, ease: "power2.in" }, 0.492);
  tl.to(uniformProxies.transition, { ripple: 0, duration: 0.02, ease: "power2.out" }, 0.506);
  tl.to(uniformProxies.grade, { underwater: 1, duration: 0.018 }, 0.495);
  tl.to(a, { underwaterLight: 1, duration: 0.03 }, 0.5);
  tl.to(uniformProxies.fog, { density: 0.055, duration: 0.02 }, 0.5);
  tl.to(uniformProxies.fog.color, { r: 0.005, g: 0.045, b: 0.075, duration: 0.02 }, 0.5);

  // The plunge tears a curtain of bubbles that thins into sparse strays.
  tl.to(a, { bubbleBurst: 1, duration: 0.012, ease: "power2.in" }, 0.494);
  tl.to(a, { bubbleBurst: 0.18, duration: 0.03 }, 0.53);
  tl.to(a, { bubbleBurst: 0, duration: 0.02 }, 0.6);
  tl.to(a, { planktonGlow: 1, duration: 0.05, ease: "power2.in" }, 0.52);
  tl.to(a, { fishActivity: 1, duration: 0.04 }, 0.52);
  tl.to(a, { waveHeight: 0.7, duration: 0.06 }, 0.54);
  // Focus opens in the dive, then pulls near for the whale's passage.
  tl.to(uniformProxies.camera, { focus: 0.03, duration: 0.02 }, 0.5);
  tl.to(uniformProxies.camera, { focus: 0.015, duration: 0.02 }, 0.545);
  tl.to(uniformProxies.camera, { focus: 0.02, duration: 0.02 }, 0.61);
}
