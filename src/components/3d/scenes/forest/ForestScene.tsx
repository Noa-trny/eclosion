"use client";

import { Trees } from "./Trees";
import { Fireflies } from "./Fireflies";
import { MoonShafts } from "./MoonShafts";
import { Undergrowth } from "./Undergrowth";
import { Owl } from "@/components/3d/encounters/Owl";

/** Act 2 — trees rise under the moon, fireflies wake between the trunks,
 *  ferns and creeping mist inhabit the floor. The ground itself is the
 *  global WorldGround mesh. */
export function ForestScene() {
  return (
    <group>
      <Trees />
      <Undergrowth />
      <Fireflies />
      <MoonShafts />
      <Owl />
    </group>
  );
}
