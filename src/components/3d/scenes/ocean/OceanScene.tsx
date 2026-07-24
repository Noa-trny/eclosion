"use client";

import { WaterSurface } from "./WaterSurface";
import { UnderwaterVolume } from "./UnderwaterVolume";
import { FishFlock } from "./FishFlock";
import { Plankton } from "./Plankton";
import { Whale } from "./Whale";
import { FishJump } from "@/components/3d/encounters/FishJump";
import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";

/** Act 4 — the signature beat: piercing the surface into bioluminescence,
 *  and, once only, a giant passing in the far blue. */
export function OceanScene() {
  return (
    <group>
      <WaterSurface />
      <UnderwaterVolume />
      <FishFlock />
      <Plankton />
      <Whale />
      <FishJump />
      {/* The dive's bubble curtain, along the descent segment of the path. */}
      <GPUParticles
        preset={PARTICLE_PRESETS.bubbles}
        position={[152, -8, 14]}
        getIntensity={() => uniformProxies.acts.bubbleBurst}
      />
    </group>
  );
}
