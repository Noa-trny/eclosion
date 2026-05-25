import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 6 (0.76–0.88) — the ash clears, petals open, birds take the sky. */
export function buildBloomTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tweenToPalette(tl, "bloom", 0.76);
  tl.to(a, { emberIntensity: 0, smokeDensity: 0.12, lavaFlow: 0.25, duration: 0.05 }, 0.76);
  tl.to(a, { snowIntensity: 0, duration: 0.04 }, 0.76);
  tl.to(uniformProxies.camera, { shake: 0, duration: 0.04 }, 0.76);
  tl.to(uniformProxies.wind, { x: 0.8, y: 0.1, z: 0.3, duration: 0.05 }, 0.77);
  tl.to(a, { ashFade: 0, duration: 0.06, ease: "power1.out" }, 0.8);
  tl.to(a, { bloomMorph: 1, duration: 0.08, ease: "power2.inOut" }, 0.78);
  tl.to(a, { birdActivity: 1, duration: 0.06, ease: "power1.in" }, 0.8);
}
