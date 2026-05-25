import gsap from "gsap";
import { PALETTES, type Rgb } from "@/config/palette";
import type { ActId } from "@/types/acts";
import { uniformProxies } from "./uniformProxies";

function rgb(color: Rgb): { r: number; g: number; b: number } {
  return { r: color[0], g: color[1], b: color[2] };
}

/** Tweens the whole atmosphere (fog, sky, lights, grade) to an act's palette.
 *  Positions/durations are in master-timeline progress units (0..1). */
export function tweenToPalette(tl: gsap.core.Timeline, act: ActId, at: number, duration = 0.04): void {
  const p = PALETTES[act];
  tl.to(uniformProxies.fog.color, { ...rgb(p.fogColor), duration }, at);
  tl.to(uniformProxies.fog, { density: p.fogDensity, duration }, at);
  tl.to(uniformProxies.sky.topColor, { ...rgb(p.skyTop), duration }, at);
  tl.to(uniformProxies.sky.bottomColor, { ...rgb(p.skyBottom), duration }, at);
  tl.to(
    uniformProxies.sky,
    { starIntensity: p.starIntensity, auroraIntensity: p.auroraIntensity, duration },
    at,
  );
  tl.to(uniformProxies.sun.color, { ...rgb(p.sunColor), duration }, at);
  tl.to(uniformProxies.sun, { intensity: p.sunIntensity, duration }, at);
  tl.to(uniformProxies.ambient.color, { ...rgb(p.ambientColor), duration }, at);
  tl.to(uniformProxies.ambient, { intensity: p.ambientIntensity, duration }, at);
  tl.to(uniformProxies.grade, { temperature: p.temperature, saturation: p.saturation, duration }, at);
}
