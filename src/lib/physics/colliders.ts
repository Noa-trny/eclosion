import { groundHeight, groundNormal } from "@/utils/terrain";
import type { PhysicsProp } from "./integrator";

const normal = { x: 0, y: 1, z: 0 };

/** Sphere-vs-heightfield against the SAME analytic ground the meshes render.
 *  Returns true when the prop is resting on the surface. */
export function resolveGround(prop: PhysicsProp): boolean {
  const ground = groundHeight(prop.px, prop.pz);
  const minY = ground + prop.radius;
  if (prop.py >= minY) return false;
  prop.py = minY;
  groundNormal(prop.px, prop.pz, normal);
  const vDotN = prop.vx * normal.x + prop.vy * normal.y + prop.vz * normal.z;
  if (vDotN < 0) {
    const r = 1 + prop.restitution;
    prop.vx -= r * vDotN * normal.x;
    prop.vy -= r * vDotN * normal.y;
    prop.vz -= r * vDotN * normal.z;
    // Tangential friction.
    prop.vx *= 0.82;
    prop.vz *= 0.82;
  }
  return true;
}
