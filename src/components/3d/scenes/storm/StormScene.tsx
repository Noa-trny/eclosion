"use client";

import { CloudLayer } from "./CloudLayer";
import { StormScud } from "./StormScud";
import { RainSystem } from "./RainSystem";
import { Lightning } from "./Lightning";

/** Act 3 — above the canopy: a cloud ceiling, ragged scud racing beneath it,
 *  rain in wind-swept curtains, lightning that is seen AND felt. */
export function StormScene() {
  return (
    <group>
      <CloudLayer />
      <StormScud />
      <RainSystem />
      <Lightning />
    </group>
  );
}
