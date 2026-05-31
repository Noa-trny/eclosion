"use client";

import { WaterSurface } from "./WaterSurface";
import { UnderwaterVolume } from "./UnderwaterVolume";
import { FishFlock } from "./FishFlock";
import { Plankton } from "./Plankton";

/** Act 4 — the signature beat: piercing the surface into bioluminescence. */
export function OceanScene() {
  return (
    <group>
      <WaterSurface />
      <UnderwaterVolume />
      <FishFlock />
      <Plankton />
    </group>
  );
}
