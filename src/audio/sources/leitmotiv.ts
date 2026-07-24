/** The seed's theme: three notes (root – fifth – octave), restated in every
 *  act with that act's character. Recognition is the point — same bones,
 *  different flesh. */

export type MotifVariant = "faint" | "music" | "pluck" | "dark" | "deep" | "tense" | "bright";

interface VariantDef {
  /** Frequency ratios over the act's root — the motif's intervals. */
  ratios: number[];
  wave: OscillatorType;
  noteDur: number;
  gap: number;
  gain: number;
  octave: number;
  filterHz: number;
}

const VARIANTS: Record<MotifVariant, VariantDef> = {
  // void: barely there, a memory of a melody
  faint: { ratios: [1, 1.5, 2], wave: "sine", noteDur: 1.8, gap: 1.0, gain: 0.035, octave: 1, filterHz: 900 },
  // seed: a music box waking up
  music: { ratios: [1, 1.5, 2], wave: "triangle", noteDur: 0.9, gap: 0.5, gain: 0.05, octave: 2, filterHz: 2400 },
  // forest: plucked, quick, alive
  pluck: { ratios: [1, 1.5, 2], wave: "triangle", noteDur: 0.45, gap: 0.34, gain: 0.05, octave: 2, filterHz: 2000 },
  // storm: the fifth flattens to a fourth — suspended, unresolved
  dark: { ratios: [1, 4 / 3, 2], wave: "sawtooth", noteDur: 1.2, gap: 0.75, gain: 0.028, octave: 1, filterHz: 700 },
  // ocean: the theme at half speed, deep and drowned
  deep: { ratios: [1, 1.5, 2], wave: "sine", noteDur: 2.4, gap: 1.5, gain: 0.05, octave: 0.5, filterHz: 600 },
  // volcano: minor third — the theme under threat
  tense: { ratios: [1, 6 / 5, 2], wave: "sawtooth", noteDur: 1.0, gap: 0.62, gain: 0.026, octave: 1, filterHz: 800 },
  // bloom & dawn: the full major statement, one note higher each time
  bright: { ratios: [1, 1.5, 2, 3], wave: "triangle", noteDur: 0.6, gap: 0.32, gain: 0.055, octave: 2, filterHz: 3200 },
};

export function playMotif(ctx: AudioContext, out: AudioNode, rootHz: number, variant: MotifVariant): void {
  const def = VARIANTS[variant];
  const start = ctx.currentTime + 0.02;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = def.filterHz;
  filter.Q.value = 0.4;
  filter.connect(out);

  const oscillators: OscillatorNode[] = [];
  def.ratios.forEach((ratio, i) => {
    const t = start + i * def.gap;
    const osc = ctx.createOscillator();
    osc.type = def.wave;
    osc.frequency.value = rootHz * def.octave * ratio;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(def.gain, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + def.noteDur);
    osc.connect(gain).connect(filter);
    osc.start(t);
    osc.stop(t + def.noteDur + 0.1);
    oscillators.push(osc);
  });
  const last = oscillators[oscillators.length - 1];
  if (last) {
    last.onended = () => {
      for (const osc of oscillators) osc.disconnect();
      filter.disconnect();
    };
  }
}
