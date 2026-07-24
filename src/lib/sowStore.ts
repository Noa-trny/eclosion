/** The visitor's sowing: every wake gesture (mouse or finger trail) leaves a
 *  seed. At the bloom act, these become GOLDEN flowers among the wild ones —
 *  the world remembers where your light passed. */

const points: number[] = [];
const MAX_POINTS = 180;

/** Records the pointer's screen-x (-1..1) at a sow moment. */
export function recordSow(x: number): void {
  if (points.length < MAX_POINTS) points.push(x);
}

export function getSowPoints(): readonly number[] {
  return points;
}
