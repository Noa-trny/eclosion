import type { ActAudioRecipe } from "@/types/audio";
import type { ActId } from "@/types/acts";

/** Equal-power crossfade half-width around each act's progress range. */
export const CROSSFADE_PAD = 0.03;

/** Bus gains below this are treated as silence and the source rack stops. */
export const SILENCE_FLOOR = 0.001;

export const MASTER_GAIN = 0.7;

/** Chords are simple just-intonation stacks — each act resolves the story. */
export const ACT_AUDIO: Record<ActId, ActAudioRecipe> = {
  void: {
    act: "void",
    chord: [55, 82.5, 110],
    // The first 30 seconds sell the audio — slightly forward.
    padGain: 0.18,
    wind: 0.05,
    rain: 0,
    ocean: 0,
    rumble: 0.04,
    oneShots: {},
  },
  seed: {
    act: "seed",
    chord: [65.4, 98.1, 130.8, 163.5],
    padGain: 0.2,
    wind: 0.06,
    rain: 0,
    ocean: 0,
    rumble: 0,
    oneShots: { droplet: 0.1 },
  },
  forest: {
    act: "forest",
    chord: [73.4, 110.1, 146.8, 220.2],
    padGain: 0.18,
    wind: 0.12,
    rain: 0,
    ocean: 0,
    rumble: 0,
    oneShots: { bird: 0.12, droplet: 0.05 },
  },
  storm: {
    act: "storm",
    chord: [61.7, 92.6, 123.4],
    padGain: 0.1,
    wind: 0.3,
    rain: 0.35,
    ocean: 0,
    rumble: 0.06,
    // The rain bed already carries the water — one-shots stay sparse.
    oneShots: { droplet: 0.15 },
  },
  ocean: {
    act: "ocean",
    chord: [49, 73.5, 98, 147],
    padGain: 0.2,
    wind: 0.04,
    rain: 0,
    ocean: 0.35,
    rumble: 0,
    oneShots: { droplet: 0.15 },
  },
  volcano: {
    act: "volcano",
    chord: [46.2, 69.3, 92.4],
    padGain: 0.14,
    wind: 0.08,
    rain: 0,
    ocean: 0,
    rumble: 0.3,
    oneShots: { crackle: 0.35 },
  },
  bloom: {
    act: "bloom",
    chord: [87.3, 130.9, 174.6, 261.8],
    padGain: 0.22,
    wind: 0.08,
    rain: 0,
    ocean: 0,
    rumble: 0,
    oneShots: { bird: 0.25 },
  },
  dawn: {
    act: "dawn",
    chord: [98, 147, 196, 294, 392],
    padGain: 0.26,
    wind: 0.05,
    rain: 0,
    ocean: 0,
    rumble: 0,
    oneShots: { bird: 0.3 },
  },
};
