import * as THREE from "three";
import { getActState } from "@/config/acts";
import { smootherstep } from "@/utils/math";

export interface CameraPose {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
}

/** Camera choreography per act. A Catmull-Rom curve passes exactly through
 *  every control point, and each act's progress range maps onto ITS segment
 *  range (piecewise parameterization) — so act N's beats always happen inside
 *  act N, regardless of how long other acts' paths are. */
interface ActPath {
  positions: Array<[number, number, number]>;
  lookAts: Array<[number, number, number]>;
}

const PATHS: ActPath[] = [
  // void — drifting in darkness toward the origin
  {
    positions: [[0, 9, 66], [0, 7, 52], [0, 5.5, 38]],
    lookAts: [[0, 3, 0], [0, 2.5, 0], [0, 2.4, 0]],
  },
  // seed — push-in on the glowing seed
  {
    positions: [[1.5, 4.5, 26], [2.4, 3.4, 12], [2, 3, 6.5]],
    lookAts: [[0, 2.4, 0], [0, 2.5, 0], [0, 2.6, 0]],
  },
  // forest — glide between the trees
  {
    positions: [[-4, 4, -6], [-9, 5, -22], [-2, 8, -42]],
    lookAts: [[-4, 4, -16], [-6, 8, -36], [4, 16, -60]],
  },
  // storm — rise above the canopy into the rain
  {
    positions: [[6, 16, -58], [14, 30, -72], [32, 40, -55]],
    lookAts: [[14, 26, -72], [34, 34, -52], [70, 24, -20]],
  },
  // ocean — approach, dive at local ≈0.2, bioluminescent depths
  {
    positions: [[72, 26, -18], [112, 9, 2], [141, -3, 12], [162, -13, 20], [186, -9, 12]],
    lookAts: [[105, 8, 0], [138, -4, 12], [158, -12, 19], [182, -10, 13], [212, 2, -6]],
  },
  // volcano — emerge and ascend the flank
  {
    positions: [[216, 7, -12], [252, 26, -32], [286, 50, -46]],
    lookAts: [[248, 24, -32], [288, 46, -48], [304, 44, -50]],
  },
  // bloom — descend into the meadow
  {
    positions: [[330, 22, 2], [360, 10, 30], [383, 7, 44]],
    lookAts: [[356, 10, 26], [378, 6, 42], [400, 8, 56]],
  },
  // dawn — crane up toward the sunrise
  {
    positions: [[396, 11, 54], [404, 17, 58], [412, 24, 62]],
    lookAts: [[460, 22, 64], [510, 32, 68], [560, 44, 70]],
  },
];

const FOV_KEYS: Array<{ p: number; fov: number }> = [
  { p: 0, fov: 55 },
  { p: 0.13, fov: 42 },
  { p: 0.2, fov: 60 },
  { p: 0.42, fov: 68 },
  { p: 0.5, fov: 75 },
  { p: 0.57, fov: 64 },
  { p: 0.7, fov: 58 },
  { p: 0.88, fov: 52 },
  { p: 1, fov: 47 },
];

/** Flat point lists + per-act segment boundaries (in flat point index). */
const POSITION_POINTS: Array<[number, number, number]> = PATHS.flatMap((a) => a.positions);
const LOOKAT_POINTS: Array<[number, number, number]> = PATHS.flatMap((a) => a.lookAts);
const POS_BOUNDS = actBounds(PATHS.map((a) => a.positions.length));
const LOOK_BOUNDS = actBounds(PATHS.map((a) => a.lookAts.length));

function actBounds(lengths: number[]): Array<[number, number]> {
  const bounds: Array<[number, number]> = [];
  let start = 0;
  for (const len of lengths) {
    bounds.push([start, start + len - 1]);
    start += len;
  }
  return bounds;
}

let positionCurve = buildCurve(POSITION_POINTS);
const lookAtCurve = buildCurve(LOOKAT_POINTS);

function buildCurve(points: Array<[number, number, number]>): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
  );
}

/** Uniform curve parameter for (act, local) given segment bounds — the curve
 *  hits control point i exactly at u = i/(N-1). */
function actParam(bounds: Array<[number, number]>, total: number, act: number, local: number): number {
  const b = bounds[act];
  if (!b) return 0;
  const [startIdx, endIdx] = b;
  return (startIdx + local * (endIdx - startIdx)) / (total - 1);
}

export function sampleCameraFov(p: number): number {
  let prev = FOV_KEYS[0];
  if (!prev) return 55;
  for (const key of FOV_KEYS) {
    if (p <= key.p) {
      const span = key.p - prev.p;
      const t = span > 0 ? smootherstep(0, 1, (p - prev.p) / span) : 0;
      return prev.fov + (key.fov - prev.fov) * t;
    }
    prev = key;
  }
  return prev.fov;
}

export function sampleCameraPath(p: number, out: CameraPose): CameraPose {
  const clamped = Math.min(1, Math.max(0, p));
  const { index, local } = getActState(clamped);
  positionCurve.getPoint(actParam(POS_BOUNDS, POSITION_POINTS.length, index, local), out.position);
  lookAtCurve.getPoint(actParam(LOOK_BOUNDS, LOOKAT_POINTS.length, index, local), out.lookAt);
  out.fov = sampleCameraFov(clamped);
  return out;
}

export function getCameraPointCount(): number {
  return POSITION_POINTS.length;
}

export function getCameraPoint(index: number): [number, number, number] {
  return POSITION_POINTS[index] ?? [0, 0, 0];
}

/** Editor hook — mutates a control point and rebuilds the curve live. */
export function updateCameraPoint(index: number, value: [number, number, number]): void {
  if (index < 0 || index >= POSITION_POINTS.length) return;
  POSITION_POINTS[index] = value;
  positionCurve = buildCurve(POSITION_POINTS);
}

export function exportCameraPoints(): Array<[number, number, number]> {
  return POSITION_POINTS.map((point) => [...point] as [number, number, number]);
}

/** No-op placeholder kept for the editor seam (uniform param needs no cache). */
export function refreshCurves(): void {}
