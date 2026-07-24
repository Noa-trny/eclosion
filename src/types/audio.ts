import type { ActId } from "./acts";
import type { MotifVariant } from "@/audio/sources/leitmotiv";

export type OneShotKind = "bird" | "droplet" | "crackle" | "thunder";

/** A running set of synthesized sources feeding one act bus. */
export interface SourceRack {
  stop: () => void;
}

export interface ActAudioRecipe {
  act: ActId;
  /** Chord frequencies (Hz) for the pad synth of this act. */
  chord: number[];
  padGain: number;
  wind: number;
  rain: number;
  ocean: number;
  rumble: number;
  /** One-shots scheduled probabilistically while the act is audible. */
  oneShots: Partial<Record<OneShotKind, number>>;
  /** The seed theme, restated in this act's character every ~N seconds. */
  motif: { every: number; variant: MotifVariant };
}
