"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";
import { OCEAN_CENTER, WATER_LEVEL } from "@/config/world";

/** Bioluminescent drift filling the dive — the ocean's own light. */
export function Plankton() {
  return (
    <GPUParticles
      preset={PARTICLE_PRESETS.plankton}
      position={[OCEAN_CENTER[0], WATER_LEVEL - 12, OCEAN_CENTER[1]]}
      getIntensity={() => uniformProxies.acts.planktonGlow}
    />
  );
}
