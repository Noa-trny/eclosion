"use client";

import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";
import { ShootingStars } from "./ShootingStars";

/** Act 0 — darkness. Drifting motes betray that space has depth, and a rare
 *  shooting star rewards the patient; the star dome itself is global. */
export function VoidScene() {
  return (
    <group>
      <GPUParticles
        preset={PARTICLE_PRESETS.dust}
        position={[0, 6, 28]}
        getIntensity={() => uniformProxies.acts.dustIntensity}
      />
      <ShootingStars />
    </group>
  );
}
