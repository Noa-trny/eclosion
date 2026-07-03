import type { SourceRack } from "@/types/audio";

let whiteBuffer: AudioBuffer | null = null;
let brownBuffer: AudioBuffer | null = null;

function getWhiteBuffer(ctx: AudioContext): AudioBuffer {
  if (whiteBuffer && whiteBuffer.sampleRate === ctx.sampleRate) return whiteBuffer;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  whiteBuffer = buffer;
  return buffer;
}

function getBrownBuffer(ctx: AudioContext): AudioBuffer {
  if (brownBuffer && brownBuffer.sampleRate === ctx.sampleRate) return brownBuffer;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // Leaky integrator over white noise ≈ brown noise.
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  brownBuffer = buffer;
  return buffer;
}

function loopBuffer(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start();
  return src;
}

interface FilteredNoiseOptions {
  type: BiquadFilterType;
  frequency: number;
  q?: number;
  level: number;
  brown?: boolean;
  /** Optional LFO on the filter frequency (wind gusts, ocean swell). */
  lfo?: { rate: number; depth: number };
  /** Optional LFO on the gain (amplitude swell). */
  am?: { rate: number; depth: number };
}

function makeFilteredNoise(ctx: AudioContext, out: AudioNode, options: FilteredNoiseOptions): SourceRack {
  const src = loopBuffer(ctx, options.brown ? getBrownBuffer(ctx) : getWhiteBuffer(ctx));
  const filter = ctx.createBiquadFilter();
  filter.type = options.type;
  filter.frequency.value = options.frequency;
  filter.Q.value = options.q ?? 0.8;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(options.level, ctx.currentTime, 1.2);
  src.connect(filter).connect(gain).connect(out);

  const extras: AudioNode[] = [];
  if (options.lfo) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = options.lfo.rate;
    const depth = ctx.createGain();
    depth.gain.value = options.lfo.depth;
    lfo.connect(depth).connect(filter.frequency);
    lfo.start();
    extras.push(lfo, depth);
  }
  if (options.am) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = options.am.rate;
    const depth = ctx.createGain();
    depth.gain.value = options.level * options.am.depth;
    lfo.connect(depth).connect(gain.gain);
    lfo.start();
    extras.push(lfo, depth);
  }

  return {
    stop: () => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => {
        src.stop();
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
        for (const node of extras) node.disconnect();
      }, 2000);
    },
  };
}

/** Velocity gust: an always-ready noise bed whose gain/brightness follow the
 *  scroll speed — fast scrolling is HEARD as rushing air. */
export function makeGust(ctx: AudioContext, out: AudioNode): { set: (g: number) => void } {
  const src = loopBuffer(ctx, getWhiteBuffer(ctx));
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(out);
  return {
    set: (g) => {
      const t = ctx.currentTime;
      gain.gain.setTargetAtTime(g * 0.22, t, 0.18);
      filter.frequency.setTargetAtTime(420 + g * 750, t, 0.18);
    },
  };
}

export function makeWind(ctx: AudioContext, out: AudioNode, level: number): SourceRack {
  return makeFilteredNoise(ctx, out, {
    type: "bandpass",
    frequency: 380,
    q: 0.6,
    level,
    lfo: { rate: 0.11, depth: 160 },
    am: { rate: 0.07, depth: 0.5 },
  });
}

export function makeRain(ctx: AudioContext, out: AudioNode, level: number): SourceRack {
  return makeFilteredNoise(ctx, out, { type: "highpass", frequency: 1300, level });
}

export function makeOcean(ctx: AudioContext, out: AudioNode, level: number): SourceRack {
  return makeFilteredNoise(ctx, out, {
    type: "lowpass",
    frequency: 420,
    level,
    brown: true,
    am: { rate: 0.07, depth: 0.7 },
  });
}

export function makeRumble(ctx: AudioContext, out: AudioNode, level: number): SourceRack {
  return makeFilteredNoise(ctx, out, {
    type: "lowpass",
    frequency: 85,
    level,
    brown: true,
    am: { rate: 0.16, depth: 0.5 },
  });
}
