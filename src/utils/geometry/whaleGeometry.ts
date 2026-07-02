import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Body radius along the length (t: 0 = tail tip, 1 = snout) — blunt rounded
 *  head, thick chest, long tapering tail stock: the rorqual silhouette. */
const PROFILE: Array<[number, number]> = [
  [0, 0.12],
  [0.12, 0.38],
  [0.3, 0.8],
  [0.5, 1.25],
  [0.68, 1.5],
  [0.82, 1.55],
  [0.92, 1.45],
  [0.975, 1.05],
  [1, 0.05],
];

function tri(
  positions: number[],
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
): void {
  positions.push(...a, ...b, ...c);
}

/** A whale that reads as a whale in silhouette: blunt head (+x), dorsal fin,
 *  swept pectoral fins, broad horizontal fluke. */
export function createWhaleGeometry(): THREE.BufferGeometry {
  const profile = PROFILE.map(([t, r]) => new THREE.Vector2(Math.max(r, 0.02), t * 14 - 7));
  const lathe = new THREE.LatheGeometry(profile, 18);
  // Lathe axis is +y; rotate so the whale swims along +x (head at +x).
  lathe.rotateZ(-Math.PI / 2);
  // Slightly deeper than wide, like a rorqual chest.
  lathe.scale(1, 1.08, 0.92);
  const body = lathe.toNonIndexed();
  lathe.dispose();

  const finPositions: number[] = [];
  // Broad swept fluke (horizontal), span ±3.6.
  tri(finPositions, [-6.7, 0.1, 0], [-9.6, 0.45, 3.6], [-8.2, 0.25, 0.9]);
  tri(finPositions, [-6.7, 0.1, 0], [-8.2, 0.25, -0.9], [-9.6, 0.45, -3.6]);
  // Dorsal fin, small and set back.
  tri(finPositions, [-2.6, 1.35, 0], [-1.2, 1.45, 0], [-2.9, 2.5, 0]);
  // Pectoral fins sweeping back-down-out from under the chest.
  tri(finPositions, [1.8, -1, 0.7], [0.9, -1.1, 1], [-1.6, -2.5, 3]);
  tri(finPositions, [1.8, -1, -0.7], [-1.6, -2.5, -3], [0.9, -1.1, -1]);
  const fins = new THREE.BufferGeometry();
  fins.setAttribute("position", new THREE.BufferAttribute(new Float32Array(finPositions), 3));
  fins.setAttribute("uv", new THREE.BufferAttribute(new Float32Array((finPositions.length / 3) * 2), 2));
  fins.computeVertexNormals();

  const merged = mergeGeometries([body, fins], false);
  body.dispose();
  fins.dispose();
  return merged ?? new THREE.BufferGeometry();
}
