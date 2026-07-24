"use client";

import { LavaFlow } from "./LavaFlow";
import { SmokeColumn } from "./SmokeColumn";
import { Embers } from "./Embers";
import { CraterGlow } from "./CraterGlow";
import { VolcanoRocks } from "./VolcanoRocks";

/** Act 5 — the forge: crater lake, lava ribbons, embers, a column of smoke.
 *  The cone itself is part of the global ground; its crater glow is driven
 *  through the terrain material by lavaFlow. */
export function VolcanoScene() {
  return (
    <group>
      <LavaFlow />
      <CraterGlow />
      <VolcanoRocks />
      <SmokeColumn />
      <Embers />
    </group>
  );
}
