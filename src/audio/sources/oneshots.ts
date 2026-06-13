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
