"use client";

import { Flowers } from "./Flowers";
import { BirdFlock } from "./BirdFlock";
import { AshClearing } from "./AshClearing";
import { SeedPods } from "./SeedPods";

/** Act 6 — ash clears, the meadow blooms, birds take the sky. */
export function BloomScene() {
  return (
    <group>
      <AshClearing />
      <Flowers />
      <BirdFlock />
      <SeedPods />
    </group>
  );
}
