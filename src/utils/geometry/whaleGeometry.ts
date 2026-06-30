import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** A distant silhouette whale, nose at +x: lathed body + horizontal fluke.
 *  Rendered dark against the bioluminescent fog — shape over detail. */
export function createWhaleGeometry(): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Blunt head, thick body, tapering tail stock.
    const r = 1.5 * Math.pow(Math.sin(Math.min(t * 1.05, 1) * Math.PI), 0.7) * (1 - t * 0.45);
    profile.push(new THREE.Vector2(Math.max(r, 0.02), t * 14 - 7));
  }
  const lathe = new THREE.LatheGeometry(profile, 16);
  // Lathe axis is +y; rotate so the whale swims along +x (head at +x).
  lathe.rotateZ(-Math.PI / 2);
  // mergeGeometries needs matching attribute sets: de-index the lathe and
  // give the fluke the same position/normal/uv trio.
  const body = lathe.toNonIndexed();
  lathe.dispose();

  // Horizontal fluke: a chevron of two triangles at the tail.
  const fluke = new THREE.BufferGeometry();
  const flukeVerts = new Float32Array([
    -6.6, 0, 0, -8.6, 0.2, 2.6, -8.1, 0.1, 0.7,
    -6.6, 0, 0, -8.1, 0.1, -0.7, -8.6, 0.2, -2.6,
  ]);
  fluke.setAttribute("position", new THREE.BufferAttribute(flukeVerts, 3));
  fluke.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(12), 2));
  fluke.computeVertexNormals();

  const merged = mergeGeometries([body, fluke], false);
  body.dispose();
  fluke.dispose();
  return merged ?? new THREE.BufferGeometry();
}
