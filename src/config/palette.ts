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
    fogColor: [0.012, 0.016, 0.028],
    fogDensity: 0.02,
    skyTop: [0.004, 0.006, 0.012],
    skyBottom: [0.01, 0.012, 0.022],
    sunColor: [0.4, 0.5, 0.8],
    sunIntensity: 0.05,
    ambientColor: [0.25, 0.3, 0.5],
    ambientIntensity: 0.06,
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
    fogDensity: 0.024,
    skyTop: [0.008, 0.02, 0.045],
    skyBottom: [0.03, 0.07, 0.09],
    sunColor: [0.65, 0.8, 1],
    sunIntensity: 0.5,
    ambientColor: [0.3, 0.5, 0.55],
    ambientIntensity: 0.18,
    temperature: -0.2,
    saturation: 1.05,
    starIntensity: 0.55,
    auroraIntensity: 0.15,
  },
  storm: {
    fogColor: [0.05, 0.055, 0.065],
    fogDensity: 0.03,
    skyTop: [0.04, 0.045, 0.055],
    skyBottom: [0.09, 0.095, 0.11],
    sunColor: [0.6, 0.62, 0.7],
    sunIntensity: 0.3,
    ambientColor: [0.45, 0.48, 0.55],
    ambientIntensity: 0.22,
    temperature: -0.35,
    saturation: 0.6,
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
    fogColor: [0.06, 0.03, 0.02],
    fogDensity: 0.028,
    skyTop: [0.03, 0.015, 0.015],
    skyBottom: [0.14, 0.05, 0.02],
    sunColor: [1, 0.45, 0.15],
    sunIntensity: 0.55,
    ambientColor: [0.6, 0.3, 0.2],
    ambientIntensity: 0.2,
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
