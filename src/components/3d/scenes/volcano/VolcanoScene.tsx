"use client";

import { LavaFlow } from "./LavaFlow";
import { SmokeColumn } from "./SmokeColumn";
import { Embers } from "./Embers";
import { CraterGlow } from "./CraterGlow";

/** Act 5 — the forge: crater lake, lava ribbons, embers, a column of smoke.
 *  The cone itself is part of the global ground; its crater glow is driven
 *  through the terrain material by lavaFlow. */
export function VolcanoScene() {
  return (
    <group>
      <LavaFlow />
      <CraterGlow />
      <SmokeColumn />
      <Embers />
    </group>
  );
}
