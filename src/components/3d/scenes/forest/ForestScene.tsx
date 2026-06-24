"use client";

import { Trees } from "./Trees";
import { Fireflies } from "./Fireflies";
import { Moon } from "./Moon";
import { Undergrowth } from "./Undergrowth";

/** Act 2 — trees rise under the moon, fireflies wake between the trunks,
 *  ferns and creeping mist inhabit the floor. The ground itself is the
 *  global WorldGround mesh. */
export function ForestScene() {
  return (
    <group>
      <Trees />
      <Undergrowth />
      <Fireflies />
      <Moon />
    </group>
  );
}
