"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";
import { MEADOW_CENTER } from "@/config/world";

/** The last ash sifting down before the color returns. */
export function AshClearing() {
  return (
    <GPUParticles
      preset={PARTICLE_PRESETS.ash}
      position={[MEADOW_CENTER[0] - 20, 18, MEADOW_CENTER[1] - 10]}
      getIntensity={() => uniformProxies.acts.ashFade}
    />
  );
}
