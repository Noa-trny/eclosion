/** Synthesized one-shots. Each writes its own envelope against ctx.currentTime
 *  (never rAF time) and cleans itself up after playing. */

export function playBird(ctx: AudioContext, out: AudioNode): void {
  const t = ctx.currentTime;
  const carrier = ctx.createOscillator();
  carrier.type = "sine";
  const mod = ctx.createOscillator();
  mod.type = "sine";
  mod.frequency.value = 40 + Math.random() * 30;
  const modDepth = ctx.createGain();
  modDepth.gain.value = 300;
  mod.connect(modDepth).connect(carrier.frequency);

  const base = 1900 + Math.random() * 900;
  carrier.frequency.setValueAtTime(base, t);
  carrier.frequency.exponentialRampToValueAtTime(base * 1.4, t + 0.07);
  carrier.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.16);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  carrier.connect(gain).connect(out);
  carrier.start(t);
  mod.start(t);
  carrier.stop(t + 0.3);
  mod.stop(t + 0.3);
  carrier.onended = () => {
    carrier.disconnect();
    mod.disconnect();
    modDepth.disconnect();
    gain.disconnect();
  };
}

export function playDroplet(ctx: AudioContext, out: AudioNode): void {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  const f = 2100 + Math.random() * 1800;
  osc.frequency.setValueAtTime(f, t);
  osc.frequency.exponentialRampToValueAtTime(f * 0.65, t + 0.05);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.035, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.1);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

export function playCrackle(ctx: AudioContext, out: AudioNode): void {
  const t = ctx.currentTime;
  const length = Math.floor(ctx.sampleRate * 0.09);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900 + Math.random() * 1300;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  src.connect(filter).connect(gain).connect(out);
  src.start(t);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

/** A soft bell tone (sine + detuned partial, long decay) for the finale. */
export function playBell(ctx: AudioContext, out: AudioNode, frequency: number, at: number): void {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.05, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 3.2);
  gain.connect(out);
  const oscillators: OscillatorNode[] = [];
  for (const [ratio, level] of [
    [1, 1],
    [2.76, 0.28],
    [5.4, 0.08],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency * ratio;
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g).connect(gain);
    osc.start(at);
    osc.stop(at + 3.4);
    oscillators.push(osc);
  }
  const first = oscillators[0];
  if (first) {
    first.onended = () => {
      for (const osc of oscillators) osc.disconnect();
      gain.disconnect();
    };
  }
}

/** Whale call: a slow sine glide (up then settling down) with gentle vibrato,
 *  doubled by a detuned partner, ringing through a dark watery echo. */
export function playWhale(ctx: AudioContext, out: AudioNode): void {
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.15, t + 1.2);
  gain.gain.setTargetAtTime(0, t + 2.8, 0.9);

  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = 0.55;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.34;
  const damp = ctx.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 850;
  gain.connect(out);
  gain.connect(delay);
  delay.connect(damp).connect(feedback).connect(delay);
  feedback.connect(out);

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 4.6;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = 2.8;
  vibrato.connect(vibratoDepth);
  vibrato.start(t);
  vibrato.stop(t + 5);

  const oscillators: OscillatorNode[] = [];
  for (const detune of [0, 8]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(52, t);
    osc.frequency.exponentialRampToValueAtTime(108, t + 1.5);
    osc.frequency.exponentialRampToValueAtTime(64, t + 3.6);
    vibratoDepth.connect(osc.frequency);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 5);
    oscillators.push(osc);
  }
  // Let the echo tail ring out before tearing the graph down.
  setTimeout(() => {
    for (const osc of oscillators) osc.disconnect();
    vibrato.disconnect();
    vibratoDepth.disconnect();
    gain.disconnect();
    delay.disconnect();
    damp.disconnect();
    feedback.disconnect();
  }, 9000);
}

/** Thunder: delayed (distance) brown-ish burst with a long lowpassed tail. */
export function playThunder(ctx: AudioContext, out: AudioNode): void {
  const delay = 0.3 + Math.random() * 1.2;
  const t = ctx.currentTime + delay;
  const length = Math.floor(ctx.sampleRate * 2.8);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.03 * (Math.random() * 2 - 1)) / 1.03;
    data[i] = last * 4 * Math.exp(-i / (length * 0.35));
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(140, t);
  filter.frequency.exponentialRampToValueAtTime(70, t + 2.2);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, t);
  src.connect(filter).connect(gain).connect(out);
  src.start(t);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}
