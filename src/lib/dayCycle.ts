/** Free-roam day cycle: while exploring, time flows again — a full day in
 *  five minutes. This is the reason to STAY: watch dawn reach the crater,
 *  noon on the meadow, dusk drowning the forest. Pure light, no objects. */

export const CYCLE_PERIOD_SEC = 300;

export interface CycleLook {
  sunElevation: number;
  sunAzimuth: number;
  skyTop: [number, number, number];
  skyBottom: [number, number, number];
  fog: [number, number, number];
  sun: [number, number, number];
  ambient: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
}

const NIGHT = {
  skyTop: [0.015, 0.025, 0.07] as const,
  skyBottom: [0.05, 0.07, 0.13] as const,
  fog: [0.04, 0.05, 0.09] as const,
  sun: [0.55, 0.65, 0.95] as const,
  ambient: [0.28, 0.33, 0.5] as const,
  sunIntensity: 0.3,
  ambientIntensity: 0.3,
};

const DAY = {
  skyTop: [0.22, 0.42, 0.74] as const,
  skyBottom: [0.62, 0.75, 0.88] as const,
  fog: [0.52, 0.62, 0.75] as const,
  sun: [1, 0.95, 0.84] as const,
  ambient: [0.6, 0.66, 0.78] as const,
  sunIntensity: 1.05,
  ambientIntensity: 0.55,
};

/** Warm rim colours poured in around sunrise/sunset. */
const EMBER: [number, number, number] = [1, 0.55, 0.24];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** phase 0..1 = one full day starting in deep night. */
export function computeCycleLook(phase: number): CycleLook {
  const angle = phase * Math.PI * 2;
  // Elevation swings below the horizon at night; azimuth sweeps the world.
  const sunElevation = Math.sin(angle - Math.PI / 2) * 0.95;
  const sunAzimuth = angle * 0.7 + 0.6;
  // Daylight follows elevation; the golden hour peaks as the sun crosses 0.
  const daylight = Math.min(1, Math.max(0, (sunElevation + 0.12) / 0.45));
  const golden = Math.exp(-Math.pow(sunElevation / 0.16, 2));

  const skyBottom = lerp3(lerp3(NIGHT.skyBottom, DAY.skyBottom, daylight), EMBER, golden * 0.55);
  const fog = lerp3(lerp3(NIGHT.fog, DAY.fog, daylight), EMBER, golden * 0.3);
  const sun = lerp3(lerp3(NIGHT.sun, DAY.sun, daylight), EMBER, golden * 0.6);
  return {
    sunElevation,
    sunAzimuth,
    skyTop: lerp3(NIGHT.skyTop, DAY.skyTop, daylight),
    skyBottom,
    fog,
    sun,
    ambient: lerp3(NIGHT.ambient, DAY.ambient, daylight),
    sunIntensity: lerp(NIGHT.sunIntensity, DAY.sunIntensity, daylight) + golden * 0.25,
    ambientIntensity: lerp(NIGHT.ambientIntensity, DAY.ambientIntensity, daylight),
  };
}
