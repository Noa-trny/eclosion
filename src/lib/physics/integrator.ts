export interface PhysicsProp {
  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  restitution: number;
  sleeping: boolean;
}

const GRAVITY = -9.8;
const AIR_DRAG = 0.4;
const SLEEP_SPEED = 0.08;

/** Semi-implicit Euler with capped dt; collision is delegated to a resolver
 *  so the integrator stays surface-agnostic. */
export function stepProp(
  prop: PhysicsProp,
  dt: number,
  wind: { x: number; y: number; z: number },
  resolve: (prop: PhysicsProp) => boolean,
): void {
  if (prop.sleeping) return;
  const d = Math.min(dt, 0.05);
  prop.vx += (wind.x * 0.6 - prop.vx * AIR_DRAG) * d;
  prop.vy += (GRAVITY + wind.y * 0.4 - prop.vy * AIR_DRAG * 0.3) * d;
  prop.vz += (wind.z * 0.6 - prop.vz * AIR_DRAG) * d;
  prop.px += prop.vx * d;
  prop.py += prop.vy * d;
  prop.pz += prop.vz * d;
  const grounded = resolve(prop);
  if (grounded && Math.hypot(prop.vx, prop.vy, prop.vz) < SLEEP_SPEED) {
    prop.sleeping = true;
  }
}

export function wakeProp(prop: PhysicsProp, impulse: [number, number, number]): void {
  prop.sleeping = false;
  prop.vx += impulse[0];
  prop.vy += impulse[1];
  prop.vz += impulse[2];
}
