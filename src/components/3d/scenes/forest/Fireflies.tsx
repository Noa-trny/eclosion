"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";
import { FOREST_CENTER } from "@/config/world";

export function Fireflies() {
  return (
    <GPUParticles
      preset={PARTICLE_PRESETS.fireflies}
      position={[FOREST_CENTER[0], 5, FOREST_CENTER[1]]}
      getIntensity={() => uniformProxies.acts.fireflyIntensity}
    />
  );
}
