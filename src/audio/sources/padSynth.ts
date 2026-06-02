import type { SourceRack } from "@/types/audio";

/** Warm pad: per chord note, two detuned triangles through a slowly breathing
 *  lowpass — the harmonic identity of each act. */
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
  for (const freq of chord) {
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
    }
  }

  return {
    stop: () => {
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
