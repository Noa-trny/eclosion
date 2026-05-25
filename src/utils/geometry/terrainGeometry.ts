import * as THREE from "three";
import { groundHeight } from "@/utils/terrain";

/** Heightfield patch sampling the global analytic ground — the mesh you see
 *  is exactly the surface physics and free-roam walk on. Position the mesh at
 *  [centerX, 0, centerZ]. */
export function createTerrainGeometry(
  centerX: number,
  centerZ: number,
  size: number,
  segments: number,
  sizeZ = size,
  segmentsZ = segments,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(size, sizeZ, segments, segmentsZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + centerX;
      const z = pos.getZ(i) + centerZ;
      pos.setY(i, groundHeight(x, z));
    }
    pos.needsUpdate = true;
  }
  geo.computeVertexNormals();
  return geo;
}
