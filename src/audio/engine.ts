import { ACTS } from "@/config/acts";
import { ACT_AUDIO, MASTER_GAIN, SILENCE_FLOOR } from "@/config/audio";
import type { ActId, ActRange } from "@/types/acts";
import type { OneShotKind, SourceRack } from "@/types/audio";
import { useProgressStore } from "@/stores/progressStore";
import { actGain } from "./buses";
import { makeGust, makeOcean, makeRain, makeRumble, makeWind } from "./sources/noiseSources";
import { makePad } from "./sources/padSynth";
import { playBell, playBird, playCrackle, playDroplet, playThunder, playWhale } from "./sources/oneshots";
import { playMotif } from "./sources/leitmotiv";
import { PannerPool, syncListener } from "./spatial";
import { OneShotScheduler } from "./scheduler";

/** Graph: act racks → act buses → master → compressor → destination.
 *  Racks (the actual synth sources) start/stop with audibility so only 2–3
 *  acts consume CPU at any moment. Constructed lazily inside a user gesture. */
class AudioEngine {
  readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly buses = new Map<ActId, GainNode>();
  private readonly racks = new Map<ActId, SourceRack[]>();
  private readonly gains = new Map<ActId, number>();
  private readonly pool: PannerPool;
  private readonly scheduler: OneShotScheduler;
  private readonly unsubscribe: () => void;
  private readonly underwaterFilter: BiquadFilterNode;
  private readonly gust: { set: (g: number) => void };
  private simRacks: SourceRack[] = [];
  private lastProgress = -1;
  private listenerPos = { x: 0, y: 0, z: 0 };
  private finalePlayed = false;
  private motifCountdown = 4;
  private motifTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.ctx = new AudioContext();
    // Chain: master → underwater lowpass → glue compressor (musical) → hard
    // safety limiter (never clips, never pumps on thunder).
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.1;
    limiter.connect(this.ctx.destination);
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.25;
    compressor.connect(limiter);
    this.underwaterFilter = this.ctx.createBiquadFilter();
    this.underwaterFilter.type = "lowpass";
    this.underwaterFilter.frequency.value = 18000;
    this.underwaterFilter.Q.value = 0.4;
    this.underwaterFilter.connect(compressor);
    this.master = this.ctx.createGain();
    this.master.gain.value = MASTER_GAIN;
    this.master.connect(this.underwaterFilter);
    for (const act of ACTS) {
      const bus = this.ctx.createGain();
      bus.gain.value = 0;
      bus.connect(this.master);
      this.buses.set(act.id, bus);
      this.gains.set(act.id, 0);
    }
    this.gust = makeGust(this.ctx, this.master);
    this.pool = new PannerPool(this.ctx, this.master);
    this.scheduler = new OneShotScheduler(
      (i) => {
        const act = ACTS[i];
        return act ? (this.gains.get(act.id) ?? 0) : 0;
      },
      (kind) => this.playOneShot(kind),
    );
    this.scheduler.start();
    // The leitmotiv: the seed's three notes, restated in the character of
    // whichever act currently owns the mix.
    this.motifTimer = setInterval(() => {
      this.motifCountdown -= 0.5;
      if (this.motifCountdown > 0) return;
      let bestAct = ACTS[0];
      let bestGain = 0;
      for (const act of ACTS) {
        const gain = this.gains.get(act.id) ?? 0;
        if (gain > bestGain) {
          bestGain = gain;
          bestAct = act;
        }
      }
      if (!bestAct || bestGain < 0.35) return;
      const recipe = ACT_AUDIO[bestAct.id];
      const bus = this.buses.get(bestAct.id);
      const root = recipe.chord[0];
      if (bus && root) playMotif(this.ctx, bus, root * 2, recipe.motif.variant);
      this.motifCountdown = recipe.motif.every + Math.random() * 3;
    }, 500);
    this.unsubscribe = useProgressStore.subscribe((state) => {
      // ~Throttle: only re-evaluate when progress moved meaningfully.
      if (Math.abs(state.progress - this.lastProgress) < 0.002) return;
      this.lastProgress = state.progress;
      this.updateGains(state.progress);
    });
    this.updateGains(useProgressStore.getState().progress);
  }

  /** Must run inside the user gesture; the silent blip unlocks stubborn iOS. */
  resume(): void {
    void this.ctx.resume();
    const blip = this.ctx.createBufferSource();
    blip.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
    blip.connect(this.ctx.destination);
    blip.start();
  }

  suspend(): void {
    void this.ctx.suspend();
  }

  setMuted(muted: boolean): void {
    this.master.gain.setTargetAtTime(muted ? 0 : MASTER_GAIN, this.ctx.currentTime, 0.2);
  }

  updateListener(position: { x: number; y: number; z: number }, forward: { x: number; y: number; z: number }): void {
    this.listenerPos = { ...position };
    syncListener(this.ctx, position, forward);
  }

  /** Storm lightning calls this per strike; closeness 0..1 scales the clap. */
  thunder(closeness = 0.3): void {
    playThunder(this.ctx, this.master, closeness);
  }

  /** The whale's single pass calls home — spatialized at its position. */
  whaleCall(x: number, y: number, z: number): void {
    playWhale(this.ctx, this.pool.at(x, y, z));
  }

  /** Scroll velocity (px/s) → rushing-air gust; closes the sensory loop with
   *  the visual speed blur. */
  setScrollVelocity(velocity: number): void {
    const g = Math.pow(Math.min(1, Math.abs(velocity) / 5200), 1.4);
    this.gust.set(g);
  }

  /** 0 = air, 1 = fully submerged: hearing sinks with the camera.
   *  Exponential sweep 18 kHz → ~420 Hz on the whole mix. */
  setUnderwater(factor: number): void {
    const clamped = Math.min(1, Math.max(0, factor));
    const frequency = 18000 * Math.pow(420 / 18000, clamped);
    this.underwaterFilter.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.08);
  }

  /** Free-roam: the weather sim drives dedicated rain/wind sources that are
   *  independent of the (frozen) act buses. */
  setSimWeather(rain: number, wind: number): void {
    if ((rain > 0.05 || wind > 1.2) && this.simRacks.length === 0) {
      this.simRacks = [makeRain(this.ctx, this.master, 0.12), makeWind(this.ctx, this.master, 0.1)];
    } else if (rain < 0.02 && wind < 1 && this.simRacks.length > 0) {
      for (const rack of this.simRacks) rack.stop();
      this.simRacks = [];
    }
  }

  dispose(): void {
    this.unsubscribe();
    this.scheduler.stop();
    if (this.motifTimer) clearInterval(this.motifTimer);
    for (const racks of this.racks.values()) for (const r of racks) r.stop();
    void this.ctx.close();
  }

  private updateGains(progress: number): void {
    const t = this.ctx.currentTime;
    // The finale chime: the dawn chord rings out once as an arpeggio of bells.
    if (progress > 0.95 && !this.finalePlayed) {
      this.finalePlayed = true;
      const chord = ACT_AUDIO.dawn.chord;
      chord.forEach((freq, i) => playBell(this.ctx, this.master, freq * 2, t + i * 0.42));
    } else if (progress < 0.88) {
      this.finalePlayed = false;
    }
    for (const act of ACTS) {
      const bus = this.buses.get(act.id);
      if (!bus) continue;
      const gain = actGain(progress, act.range as ActRange);
      this.gains.set(act.id, gain);
      if (gain < SILENCE_FLOOR) {
        bus.gain.setTargetAtTime(0, t, 0.15);
        const racks = this.racks.get(act.id);
        if (racks) {
          for (const rack of racks) rack.stop();
          this.racks.delete(act.id);
        }
      } else {
        if (!this.racks.has(act.id)) this.racks.set(act.id, this.buildRack(act.id));
        bus.gain.setTargetAtTime(gain, t, 0.15);
      }
    }
  }

  private buildRack(id: ActId): SourceRack[] {
    const recipe = ACT_AUDIO[id];
    const bus = this.buses.get(id);
    if (!bus) return [];
    const racks: SourceRack[] = [makePad(this.ctx, bus, recipe.chord, recipe.padGain)];
    if (recipe.wind > 0) racks.push(makeWind(this.ctx, bus, recipe.wind));
    if (recipe.rain > 0) racks.push(makeRain(this.ctx, bus, recipe.rain));
    if (recipe.ocean > 0) racks.push(makeOcean(this.ctx, bus, recipe.ocean));
    if (recipe.rumble > 0) racks.push(makeRumble(this.ctx, bus, recipe.rumble));
    return racks;
  }

  private playOneShot(kind: OneShotKind): void {
    // Spatialize around the listener — a bird in a random tree, not in your head.
    const p = this.listenerPos;
    const angle = Math.random() * Math.PI * 2;
    const dist = 6 + Math.random() * 18;
    const out = this.pool.at(p.x + Math.cos(angle) * dist, p.y + 2 + Math.random() * 8, p.z + Math.sin(angle) * dist);
    if (kind === "bird") playBird(this.ctx, out);
    else if (kind === "droplet") playDroplet(this.ctx, out);
    else if (kind === "crackle") playCrackle(this.ctx, out);
    else playThunder(this.ctx, this.master);
  }
}

let engine: AudioEngine | null = null;

/** Call ONLY from a user gesture handler the first time. */
export function initAudioEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  engine.resume();
  return engine;
}

export function getAudioEngine(): AudioEngine | null {
  return engine;
}
