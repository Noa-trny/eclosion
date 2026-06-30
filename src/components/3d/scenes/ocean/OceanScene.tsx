"use client";

import { WaterSurface } from "./WaterSurface";
import { UnderwaterVolume } from "./UnderwaterVolume";
import { FishFlock } from "./FishFlock";
import { Plankton } from "./Plankton";
import { Whale } from "./Whale";

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
    </group>
  );
}
