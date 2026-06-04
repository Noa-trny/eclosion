"use client";

import { useFrame } from "@react-three/fiber";
import { useWeatherStore } from "@/stores/weatherStore";
import { weatherSim } from "@/lib/weather/simulation";
import { uniformProxies } from "@/timelines/uniformProxies";
import { getAudioEngine } from "@/audio/engine";

/** Bridges the weather source: in scroll mode the timeline owns the proxies;
 *  in free-roam this ticks the Markov chain + day/night clock instead (and
 *  feeds the audio engine's sim-weather rain/wind bed). */
export function WeatherSystem() {
  useFrame((_, delta) => {
    if (useWeatherStore.getState().source !== "sim") return;
    weatherSim.update(Math.min(delta, 0.1));
    getAudioEngine()?.setSimWeather(
      uniformProxies.acts.rainIntensity,
      Math.hypot(uniformProxies.wind.x, uniformProxies.wind.z),
    );
  });
  return null;
}
