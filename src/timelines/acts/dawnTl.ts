import type gsap from "gsap";
import { tweenToPalette } from "../tweenHelpers";
import { uniformProxies } from "../uniformProxies";

/** Act 7 (0.88–1) — the sun crests the horizon; every light resolves warm. */
export function buildDawnTl(tl: gsap.core.Timeline): void {
  const a = uniformProxies.acts;
  tweenToPalette(tl, "dawn", 0.88, 0.06);
  tl.to(a, { sunriseProgress: 1, duration: 0.1, ease: "power1.inOut" }, 0.88);
  // Matches the Sun mesh's rise as seen from the dawn camera (≈ +x horizon).
  tl.to(uniformProxies.sky, { sunElevation: 0.16, sunAzimuth: 0.06, duration: 0.12, ease: "power1.inOut" }, 0.88);
  tl.to(uniformProxies.grade, { lift: 0.04, duration: 0.08 }, 0.9);
  tl.to(uniformProxies.fog, { density: 0.008, duration: 0.08 }, 0.92);
  // The finale: petals of light spiral toward the sun while the focal length
  // slowly tightens — the world takes one last breath in.
  tl.to(a, { finaleSwirl: 1, duration: 0.05, ease: "power2.in" }, 0.93);
  tl.to(uniformProxies.camera, { fovOffset: -6, duration: 0.07, ease: "power1.inOut" }, 0.93);
  // Deep focus for the vista — everything sharp for the last image.
  tl.to(uniformProxies.camera, { focus: 0.06, duration: 0.06 }, 0.89);
  // Pins the timeline's duration to exactly 1 progress unit.
  tl.set({}, {}, 1);
}
