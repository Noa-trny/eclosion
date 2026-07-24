import type { SourceRack } from "@/types/audio";

/** Just-intonation roots for the slow harmonic walk: I, IV, vi, V. */
const DEGREE_RATIOS = [1, 4 / 3, 5 / 6, 3 / 2];
/** Home-heavy progression that always resolves back to the act's chord. */
const PROGRESSION = [0, 0, 1, 2, 0, 3, 1, 0];
const STEP_SECONDS = 11;

/** Folds a target frequency to the octave nearest `near` — voice-leading:
 *  every chord change is the SMALLEST possible movement per voice. */
function nearestOctave(target: number, near: number): number {
  let f = target;
  while (f > near * 1.5) f /= 2;
  while (f < near / 1.5) f *= 2;
  return f;
}

/** Warm pad: per chord note, two detuned triangles through a slowly breathing
 *  lowpass — the harmonic identity of each act. The chord itself is alive:
 *  a generative I–IV–vi–V walk, each voice gliding to its nearest new note,
 *  so no two visits to an act sound identical. */
export function makePad(ctx: AudioContext, out: AudioNode, chord: number[], level: number): SourceRack {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(level, ctx.currentTime, 2.5);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 850;
  filter.Q.value = 0.4;
  filter.connect(master).connect(out);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 320;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  const oscillators: OscillatorNode[] = [];
  const noteIndex: number[] = [];
  for (let i = 0; i < chord.length; i++) {
    const freq = chord[i];
    if (freq === undefined) continue;
    for (const detune of [-6, 5]) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 1 / (chord.length * 2);
      osc.connect(g).connect(filter);
      osc.start();
      oscillators.push(osc);
      noteIndex.push(i);
    }
  }

  // The walk: desynchronized across acts by a random start offset, so two
  // audible buses never change chords in lockstep.
  let step = Math.floor(Math.random() * PROGRESSION.length);
  const progressionTimer = setInterval(
    () => {
      step = (step + 1) % PROGRESSION.length;
      const ratio = DEGREE_RATIOS[PROGRESSION[step] ?? 0] ?? 1;
      for (let i = 0; i < oscillators.length; i++) {
        const osc = oscillators[i];
        const base = chord[noteIndex[i] ?? 0];
        if (!osc || base === undefined) continue;
        const target = nearestOctave(base * ratio, osc.frequency.value);
        // Long time constant: the chord BLOOMS into the next one.
        osc.frequency.setTargetAtTime(target, ctx.currentTime, 0.9);
      }
    },
    (STEP_SECONDS + Math.random() * 4) * 1000,
  );

  return {
    stop: () => {
      clearInterval(progressionTimer);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
      setTimeout(() => {
        for (const osc of oscillators) {
          osc.stop();
          osc.disconnect();
        }
        lfo.stop();
        lfo.disconnect();
        lfoDepth.disconnect();
        filter.disconnect();
        master.disconnect();
      }, 2500);
    },
  };
}
