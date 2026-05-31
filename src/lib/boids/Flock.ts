import { mulberry32 } from "@/utils/random";
import { boundsForce, limitVector } from "./rules";

export interface FlockParams {
  count: number;
  center: readonly [number, number, number];
  size: readonly [number, number, number];
  speed: number;
  maxForce: number;
  perception: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  boundsWeight: number;
  seed: number;
}

/** CPU boids with a spatial hash grid — the NPCs of the world. 200–600 agents
 *  step in O(n · neighbors); rendering happens via InstancedMesh elsewhere. */
export class Flock {
  readonly positions: Float32Array;
  readonly velocities: Float32Array;
  readonly count: number;
  private readonly params: FlockParams;
  private readonly grid = new Map<number, number[]>();
  private readonly force: [number, number, number] = [0, 0, 0];

  constructor(params: FlockParams) {
    this.params = params;
    this.count = params.count;
    this.positions = new Float32Array(params.count * 3);
    this.velocities = new Float32Array(params.count * 3);
    const rng = mulberry32(params.seed);
    for (let i = 0; i < params.count; i++) {
      this.positions[i * 3] = params.center[0] + (rng() - 0.5) * params.size[0];
      this.positions[i * 3 + 1] = params.center[1] + (rng() - 0.5) * params.size[1];
      this.positions[i * 3 + 2] = params.center[2] + (rng() - 0.5) * params.size[2];
      this.velocities[i * 3] = (rng() - 0.5) * params.speed;
      this.velocities[i * 3 + 1] = (rng() - 0.5) * params.speed * 0.3;
      this.velocities[i * 3 + 2] = (rng() - 0.5) * params.speed;
    }
  }

  private cellKey(x: number, y: number, z: number): number {
    const s = this.params.perception;
    return ((Math.floor(x / s) * 73856093) ^ (Math.floor(y / s) * 19349663) ^ (Math.floor(z / s) * 83492791)) | 0;
  }

  /** dt is capped by the caller (fixed-step accumulation not needed at n≤600). */
  step(dt: number): void {
    const { count, positions: pos, velocities: vel, params, grid } = this;
    const d = Math.min(dt, 0.05);

    grid.clear();
    for (let i = 0; i < count; i++) {
      const key = this.cellKey(pos[i * 3] ?? 0, pos[i * 3 + 1] ?? 0, pos[i * 3 + 2] ?? 0);
      const bucket = grid.get(key);
      if (bucket) bucket.push(i);
      else grid.set(key, [i]);
    }

    const perception2 = params.perception * params.perception;
    const s = params.perception;
    for (let i = 0; i < count; i++) {
      const px = pos[i * 3] ?? 0;
      const py = pos[i * 3 + 1] ?? 0;
      const pz = pos[i * 3 + 2] ?? 0;
      let sepX = 0, sepY = 0, sepZ = 0;
      let aliX = 0, aliY = 0, aliZ = 0;
      let cohX = 0, cohY = 0, cohZ = 0;
      let n = 0;

      const cx = Math.floor(px / s);
      const cy = Math.floor(py / s);
      const cz = Math.floor(pz / s);
      for (let ox = -1; ox <= 1; ox++)
        for (let oy = -1; oy <= 1; oy++)
          for (let oz = -1; oz <= 1; oz++) {
            const bucket = grid.get(
              (((cx + ox) * 73856093) ^ ((cy + oy) * 19349663) ^ ((cz + oz) * 83492791)) | 0,
            );
            if (!bucket) continue;
            for (const j of bucket) {
              if (j === i) continue;
              const dx = (pos[j * 3] ?? 0) - px;
              const dy = (pos[j * 3 + 1] ?? 0) - py;
              const dz = (pos[j * 3 + 2] ?? 0) - pz;
              const dist2 = dx * dx + dy * dy + dz * dz;
              if (dist2 > perception2 || dist2 === 0) continue;
              const inv = 1 / dist2;
              sepX -= dx * inv;
              sepY -= dy * inv;
              sepZ -= dz * inv;
              aliX += vel[j * 3] ?? 0;
              aliY += vel[j * 3 + 1] ?? 0;
              aliZ += vel[j * 3 + 2] ?? 0;
              cohX += dx;
              cohY += dy;
              cohZ += dz;
              n++;
            }
          }

      const f = this.force;
      f[0] = 0; f[1] = 0; f[2] = 0;
      if (n > 0) {
        const invN = 1 / n;
        f[0] = sepX * params.separationWeight + aliX * invN * params.alignmentWeight + cohX * invN * params.cohesionWeight;
        f[1] = sepY * params.separationWeight + aliY * invN * params.alignmentWeight + cohY * invN * params.cohesionWeight;
        f[2] = sepZ * params.separationWeight + aliZ * invN * params.alignmentWeight + cohZ * invN * params.cohesionWeight;
      }
      const b: [number, number, number] = [0, 0, 0];
      boundsForce(px, py, pz, params.center, params.size, b);
      f[0] += b[0] * params.boundsWeight;
      f[1] += b[1] * params.boundsWeight;
      f[2] += b[2] * params.boundsWeight;
      limitVector(f, params.maxForce);

      let vx = (vel[i * 3] ?? 0) + f[0] * d;
      let vy = (vel[i * 3 + 1] ?? 0) + f[1] * d;
      let vz = (vel[i * 3 + 2] ?? 0) + f[2] * d;
      // Renormalize toward cruise speed for a lively but stable flock.
      const len = Math.hypot(vx, vy, vz) || 1;
      const target = params.speed;
      const blend = 1 + (target / len - 1) * 0.1;
      vx *= blend; vy *= blend; vz *= blend;
      vel[i * 3] = vx;
      vel[i * 3 + 1] = vy;
      vel[i * 3 + 2] = vz;
      pos[i * 3] = px + vx * d;
      pos[i * 3 + 1] = py + vy * d;
      pos[i * 3 + 2] = pz + vz * d;
    }
  }
}
