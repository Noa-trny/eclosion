"use client";

import { Trees } from "./Trees";
import { Fireflies } from "./Fireflies";
import { Moon } from "./Moon";

/** Act 2 — trees rise under the moon, fireflies wake between the trunks.
 *  The ground itself is the global WorldGround mesh. */
export function ForestScene() {
  return (
    <group>
      <Trees />
      <Fireflies />
      <Moon />
    </group>
  );
}
