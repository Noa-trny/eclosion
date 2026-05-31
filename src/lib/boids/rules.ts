/** Pure steering helpers operating on flat Float32Arrays (x,y,z triplets). */

export function limitVector(v: [number, number, number], max: number): void {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len > max && len > 0) {
    const s = max / len;
    v[0] *= s;
    v[1] *= s;
    v[2] *= s;
  }
}

/** Steer back toward the bounds center with force growing past the edge. */
export function boundsForce(
  px: number,
  py: number,
  pz: number,
  center: readonly [number, number, number],
  size: readonly [number, number, number],
  out: [number, number, number],
): void {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  const dx = px - center[0];
  const dy = py - center[1];
  const dz = pz - center[2];
  const hx = size[0] / 2;
  const hy = size[1] / 2;
  const hz = size[2] / 2;
  if (Math.abs(dx) > hx * 0.8) out[0] = -dx / hx;
  if (Math.abs(dy) > hy * 0.8) out[1] = -dy / hy;
  if (Math.abs(dz) > hz * 0.8) out[2] = -dz / hz;
}
