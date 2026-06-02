import { ACT_AUDIO } from "@/config/audio";
import { ACTS } from "@/config/acts";
import type { OneShotKind } from "@/types/audio";

const TICK_MS = 380;

/** Probabilistic one-shot scheduler: while an act is audible, its recipe's
 *  one-shots fire with the configured probability per tick. */
export class OneShotScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly getGain: (actIndex: number) => number,
    private readonly play: (kind: OneShotKind) => void,
  ) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private tick(): void {
    for (let i = 0; i < ACTS.length; i++) {
      const act = ACTS[i];
      if (!act) continue;
      const gain = this.getGain(i);
      if (gain < 0.05) continue;
      const recipe = ACT_AUDIO[act.id];
      for (const [kind, probability] of Object.entries(recipe.oneShots)) {
        if (probability !== undefined && Math.random() < probability * gain * (TICK_MS / 1000) * 2.5) {
          this.play(kind as OneShotKind);
        }
      }
    }
  }
}
