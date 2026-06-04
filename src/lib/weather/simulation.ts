import gsap from "gsap";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useWeatherStore, type WeatherKind } from "@/stores/weatherStore";
import { clamp01, lerp } from "@/utils/math";

/** Day/night cycle length in seconds while free-roaming. */
const DAY_LENGTH = 360;

/** Markov transition table — rows sum to 1. */
const TRANSITIONS: Record<WeatherKind, Array<[WeatherKind, number]>> = {
  clear: [["clear", 0.5], ["cloudy", 0.4], ["rain", 0.1]],
  cloudy: [["clear", 0.3], ["cloudy", 0.3], ["rain", 0.3], ["storm", 0.1]],
  rain: [["cloudy", 0.35], ["rain", 0.35], ["storm", 0.2], ["clear", 0.1]],
  storm: [["rain", 0.5], ["cloudy", 0.3], ["storm", 0.2]],
};

const WEATHER_TARGETS: Record<WeatherKind, { rain: number; cloud: number; wind: number; fog: number }> = {
  clear: { rain: 0, cloud: 0.05, wind: 0.5, fog: 0.012 },
  cloudy: { rain: 0, cloud: 0.6, wind: 1.1, fog: 0.02 },
  rain: { rain: 0.7, cloud: 0.85, wind: 1.8, fog: 0.028 },
  storm: { rain: 1, cloud: 1, wind: 3.4, fog: 0.034 },
};

/** Free-roam weather: a Markov chain + day/night clock writing the SAME
 *  uniformProxies the timeline scrubs — legal because the timeline is frozen
 *  (lenis stopped) for the whole free-roam session. */
class WeatherSimulation {
  private active = false;
  private tweens: gsap.core.Tween[] = [];
  private untilNextChange = 0;

  start(): void {
    if (this.active) return;
    this.active = true;
    // Seed the clock from the frozen sun elevation so the handoff is seamless.
    const el = uniformProxies.sky.sunElevation;
    const t = clamp01(Math.asin(clamp01(el + 0.5) * 2 - 1) / (Math.PI * 2) + 0.25);
    useWeatherStore.getState().setTimeOfDay(t);
    this.untilNextChange = 18;
  }

  stop(): void {
    this.active = false;
    for (const tween of this.tweens) tween.kill();
    this.tweens = [];
  }

  update(dt: number): void {
    if (!this.active) return;
    const store = useWeatherStore.getState();

    // --- Day/night clock → sun + sky + ambient.
    const t = (store.timeOfDay + dt / DAY_LENGTH) % 1;
    store.setTimeOfDay(t);
    const elevation = Math.sin((t - 0.25) * Math.PI * 2) * 0.6;
    uniformProxies.sky.sunElevation = elevation;
    uniformProxies.sky.sunAzimuth += dt * 0.01;
    const day = clamp01(elevation * 3 + 0.25);
    const sky = uniformProxies.sky;
    sky.topColor.r = lerp(0.006, 0.2, day);
    sky.topColor.g = lerp(0.01, 0.42, day);
    sky.topColor.b = lerp(0.03, 0.75, day);
    sky.bottomColor.r = lerp(0.02, 0.75, day);
    sky.bottomColor.g = lerp(0.03, 0.62, day);
    sky.bottomColor.b = lerp(0.05, 0.5, day);
    sky.starIntensity = 1 - day;
    uniformProxies.sun.intensity = lerp(0.25, 1.15, day);
    uniformProxies.sun.color.r = lerp(0.7, 1, day);
    uniformProxies.sun.color.g = lerp(0.75, 0.92, day);
    uniformProxies.sun.color.b = lerp(1, 0.75, day);
    uniformProxies.ambient.intensity = lerp(0.12, 0.42, day);

    // --- Markov weather chain.
    this.untilNextChange -= dt;
    if (this.untilNextChange <= 0) {
      this.untilNextChange = 25 + Math.random() * 20;
      const options = TRANSITIONS[store.kind];
      let roll = Math.random();
      let next: WeatherKind = store.kind;
      for (const [kind, p] of options) {
        roll -= p;
        if (roll <= 0) {
          next = kind;
          break;
        }
      }
      if (next !== store.kind) {
        store.setKind(next);
        const target = WEATHER_TARGETS[next];
        const duration = 20 + Math.random() * 15;
        for (const tween of this.tweens) tween.kill();
        this.tweens = [
          gsap.to(uniformProxies.acts, {
            rainIntensity: target.rain,
            cloudDensity: target.cloud,
            lightningActivity: next === "storm" ? 1 : 0,
            duration,
            ease: "sine.inOut",
          }),
          gsap.to(uniformProxies.wind, { x: target.wind, duration, ease: "sine.inOut" }),
          gsap.to(uniformProxies.fog, { density: target.fog, duration, ease: "sine.inOut" }),
        ];
      }
    }
  }
}

export const weatherSim = new WeatherSimulation();
