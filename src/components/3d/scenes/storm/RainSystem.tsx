"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";

/** Rain over the storm corridor — intensity is also written by the free-roam
 *  weather sim, so this system serves both modes unchanged. */
export function RainSystem() {
  return (
    <GPUParticles
      preset={PARTICLE_PRESETS.rain}
      position={[30, 28, -55]}
      getIntensity={() => uniformProxies.acts.rainIntensity}
    />
  );
}
