import type { ActId } from "@/types/acts";

export type Rgb = readonly [number, number, number];

export interface ActPalette {
  fogColor: Rgb;
  fogDensity: number;
  skyTop: Rgb;
  skyBottom: Rgb;
  sunColor: Rgb;
  sunIntensity: number;
  ambientColor: Rgb;
  ambientIntensity: number;
  /** -1 cold … +1 warm, applied by the color-grade effect. */
  temperature: number;
  saturation: number;
  starIntensity: number;
  auroraIntensity: number;
}

export const PALETTES: Record<ActId, ActPalette> = {
  void: {
    // Fog EXACTLY equals skyBottom: the fogged ground and the sky meet in
    // the same color, so no horizon line cuts through "l'obscurité absolue"
    // — there is no world yet to silhouette. Density is high enough to
    // swallow the near field, and the lights are almost out so the terrain
    // never reads before the seed's ember does.
    fogColor: [0.01, 0.012, 0.022],
    fogDensity: 0.032,
    skyTop: [0.004, 0.006, 0.012],
    skyBottom: [0.01, 0.012, 0.022],
    sunColor: [0.4, 0.5, 0.8],
    sunIntensity: 0.02,
    ambientColor: [0.25, 0.3, 0.5],
    ambientIntensity: 0.03,
    temperature: -0.15,
    saturation: 0.85,
    starIntensity: 1,
    auroraIntensity: 0,
  },
  seed: {
    fogColor: [0.03, 0.024, 0.02],
    fogDensity: 0.028,
    skyTop: [0.01, 0.01, 0.02],
    skyBottom: [0.05, 0.03, 0.02],
    sunColor: [1, 0.75, 0.45],
    sunIntensity: 0.25,
    ambientColor: [0.6, 0.45, 0.3],
    ambientIntensity: 0.12,
    temperature: 0.2,
    saturation: 0.95,
    starIntensity: 0.7,
    auroraIntensity: 0,
  },
  forest: {
    fogColor: [0.015, 0.04, 0.05],
    fogDensity: 0.028,
    skyTop: [0.008, 0.02, 0.045],
    skyBottom: [0.03, 0.07, 0.09],
    sunColor: [0.65, 0.8, 1],
    sunIntensity: 0.62,
    ambientColor: [0.3, 0.5, 0.55],
    ambientIntensity: 0.14,
    temperature: -0.2,
    saturation: 1.12,
    starIntensity: 0.55,
    auroraIntensity: 0.15,
  },
  storm: {
    // Steel-blue menace: crushed dark top vs a pale horizon, wall-of-rain fog.
    fogColor: [0.045, 0.05, 0.058],
    fogDensity: 0.036,
    skyTop: [0.018, 0.022, 0.03],
    skyBottom: [0.12, 0.115, 0.125],
    sunColor: [0.6, 0.64, 0.75],
    sunIntensity: 0.22,
    ambientColor: [0.42, 0.46, 0.56],
    ambientIntensity: 0.17,
    temperature: -0.5,
    saturation: 0.55,
    starIntensity: 0,
    auroraIntensity: 0,
  },
  ocean: {
    fogColor: [0.01, 0.06, 0.1],
    fogDensity: 0.026,
    skyTop: [0.015, 0.05, 0.1],
    skyBottom: [0.04, 0.12, 0.18],
    sunColor: [0.5, 0.8, 1],
    sunIntensity: 0.45,
    ambientColor: [0.2, 0.5, 0.7],
    ambientIntensity: 0.22,
    temperature: -0.3,
    saturation: 1.1,
    starIntensity: 0.2,
    auroraIntensity: 0.5,
  },
  volcano: {
    // Charcoal night with a fire horizon — heat lives in the lava, not in a
    // red wash over everything.
    fogColor: [0.045, 0.03, 0.026],
    fogDensity: 0.026,
    skyTop: [0.022, 0.014, 0.016],
    skyBottom: [0.13, 0.05, 0.028],
    // The MOUNTAIN is charcoal night — cool dim light; fire belongs to the
    // lava, the crater rim and the embers, never to the light rig.
    sunColor: [0.5, 0.44, 0.5],
    sunIntensity: 0.3,
    ambientColor: [0.3, 0.27, 0.32],
    ambientIntensity: 0.18,
    temperature: 0.5,
    saturation: 1.05,
    starIntensity: 0.1,
    auroraIntensity: 0,
  },
  bloom: {
    fogColor: [0.09, 0.07, 0.1],
    fogDensity: 0.018,
    skyTop: [0.06, 0.05, 0.12],
    skyBottom: [0.22, 0.13, 0.18],
    sunColor: [1, 0.7, 0.6],
    sunIntensity: 0.7,
    ambientColor: [0.6, 0.5, 0.65],
    ambientIntensity: 0.3,
    temperature: 0.15,
    saturation: 1.15,
    starIntensity: 0.15,
    auroraIntensity: 0.1,
  },
  dawn: {
    fogColor: [0.2, 0.15, 0.12],
    fogDensity: 0.01,
    skyTop: [0.16, 0.27, 0.46],
    skyBottom: [0.72, 0.45, 0.26],
    sunColor: [1, 0.85, 0.6],
    sunIntensity: 0.9,
    ambientColor: [0.8, 0.7, 0.6],
    ambientIntensity: 0.45,
    temperature: 0.35,
    saturation: 1.1,
    starIntensity: 0,
    auroraIntensity: 0,
  },
};
