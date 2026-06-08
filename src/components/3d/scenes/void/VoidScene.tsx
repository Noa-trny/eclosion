"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";

/** Act 0 — darkness. Only drifting motes betray that space has depth; the
 *  star dome and fog belong to the global environment. */
export function VoidScene() {
  return (
    <GPUParticles
      preset={PARTICLE_PRESETS.dust}
      position={[0, 6, 28]}
      getIntensity={() => uniformProxies.acts.dustIntensity}
    />
  );
}
