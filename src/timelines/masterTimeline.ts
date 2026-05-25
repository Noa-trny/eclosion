import gsap from "gsap";
import { buildVoidTl } from "./acts/voidTl";
import { buildSeedTl } from "./acts/seedTl";
import { buildForestTl } from "./acts/forestTl";
import { buildStormTl } from "./acts/stormTl";
import { buildOceanTl } from "./acts/oceanTl";
import { buildVolcanoTl } from "./acts/volcanoTl";
import { buildBloomTl } from "./acts/bloomTl";
import { buildDawnTl } from "./acts/dawnTl";

/** The single scrubbed timeline. Time units ARE progress units (duration 1).
 *  The container stays linear (`ease: "none"` defaults); only leaf tweens ease.
 *  Every tween targets the uniformProxies registry — nothing else. */
export function buildMasterTimeline(): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  buildVoidTl(tl);
  buildSeedTl(tl);
  buildForestTl(tl);
  buildStormTl(tl);
  buildOceanTl(tl);
  buildVolcanoTl(tl);
  buildBloomTl(tl);
  buildDawnTl(tl);
  return tl;
}
