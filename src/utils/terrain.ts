import { fbm2, valueNoise2 } from "./cpuNoise";
import { smoothstep } from "./math";
import {
  OCEAN_CENTER,
  OCEAN_DEPTH,
  OCEAN_RADIUS,
  VOLCANO_CENTER,
  VOLCANO_HEIGHT,
  VOLCANO_RADIUS,
  CRATER_RADIUS,
} from "@/config/world";

/** The single analytic ground function of the world. Terrain meshes, physics
 *  props, boid bounds and the free-roam clamp all sample this — so what you
 *  see, walk on and bounce off is always the same surface. */
export function groundHeight(x: number, z: number): number {
  // Gentle rolling base.
  let h = fbm2(x * 0.015 + 3.7, z * 0.015 - 1.2, 4) * 6 - 2.2;
  h += valueNoise2(x * 0.06, z * 0.06) * 1.2;

  // Ocean basin: a smooth depression.
  const [ox, oz] = OCEAN_CENTER;
  const oceanDist = Math.hypot(x - ox, z - oz);
  const basin = 1 - smoothstep(OCEAN_RADIUS * 0.45, OCEAN_RADIUS, oceanDist);
  h -= basin * (OCEAN_DEPTH + fbm2(x * 0.03, z * 0.03, 3) * 5);

  // Volcano cone with a crater dip.
  const [vx, vz] = VOLCANO_CENTER;
  const volcanoDist = Math.hypot(x - vx, z - vz);
  const cone = 1 - smoothstep(0, VOLCANO_RADIUS, volcanoDist);
  const crater = 1 - smoothstep(0, CRATER_RADIUS, volcanoDist);
  h += cone * cone * VOLCANO_HEIGHT * (1 + fbm2(x * 0.05, z * 0.05, 3) * 0.25);
  h -= crater * 12;

  return h;
}

/** Central-difference surface normal, matching groundHeight. */
export function groundNormal(x: number, z: number, out: { x: number; y: number; z: number }): void {
  const e = 0.6;
  const hx = groundHeight(x + e, z) - groundHeight(x - e, z);
  const hz = groundHeight(x, z + e) - groundHeight(x, z - e);
  const inv = 1 / Math.hypot(hx, 2 * e, hz);
  out.x = -hx * inv;
  out.y = 2 * e * inv;
  out.z = -hz * inv;
}
