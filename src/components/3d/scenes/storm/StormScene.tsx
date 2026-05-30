"use client";

import { CloudLayer } from "./CloudLayer";
import { RainSystem } from "./RainSystem";
import { Lightning } from "./Lightning";

/** Act 3 — above the canopy: clouds close, rain sweeps, lightning writes. */
export function StormScene() {
  return (
    <group>
      <CloudLayer />
      <RainSystem />
      <Lightning />
    </group>
  );
}
