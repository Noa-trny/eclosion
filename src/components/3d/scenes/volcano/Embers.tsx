"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";
import { VOLCANO_CENTER } from "@/config/world";
import { groundHeight } from "@/utils/terrain";

const craterY = groundHeight(VOLCANO_CENTER[0], VOLCANO_CENTER[1]) + 2;

export function Embers() {
  return (
    <>
      <GPUParticles
        preset={PARTICLE_PRESETS.embers}
        position={[VOLCANO_CENTER[0], 42, VOLCANO_CENTER[1]]}
        getIntensity={() => uniformProxies.acts.emberIntensity}
      />
      {/* Ballistic lava fountain sprayed from the crater mouth. */}
      <GPUParticles
        preset={PARTICLE_PRESETS.lavaBombs}
        position={[VOLCANO_CENTER[0], craterY, VOLCANO_CENTER[1]]}
        getIntensity={() => uniformProxies.acts.lavaFlow}
      />
      {/* Ash snow drifting on the cold side of the summit. */}
      <GPUParticles
        preset={PARTICLE_PRESETS.snow}
        position={[VOLCANO_CENTER[0] - 30, 60, VOLCANO_CENTER[1] + 25]}
        getIntensity={() => uniformProxies.acts.snowIntensity}
      />
    </>
  );
}
