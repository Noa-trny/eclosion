import { create } from "zustand";

export type WeatherSource = "timeline" | "sim";
export type WeatherKind = "clear" | "cloudy" | "rain" | "storm";

interface WeatherState {
  /** timeline: uniform proxies are scrubbed by scroll. sim: the Markov chain
   *  + day/night clock write the same proxies while the timeline is frozen. */
  source: WeatherSource;
  kind: WeatherKind;
  /** 0..1 — fraction of the day/night cycle (0 = midnight, 0.5 = noon). */
  timeOfDay: number;
  setSource: (source: WeatherSource) => void;
  setKind: (kind: WeatherKind) => void;
  setTimeOfDay: (t: number) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  source: "timeline",
  kind: "clear",
  timeOfDay: 0.2,
  setSource: (source) => set({ source }),
  setKind: (kind) => set({ kind }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
}));
