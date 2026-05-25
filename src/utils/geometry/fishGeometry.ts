import * as THREE from "three";

/** Low-poly fish, nose at +x, tail at -x — the tail wiggle is a vertex-shader
 *  effect (CreatureMaterial FISH), no skinning needed. */
export function createFishGeometry(): THREE.BufferGeometry {
  const v = {
    nose: [0.55, 0, 0],
    top: [0.05, 0.16, 0],
    bottom: [0.05, -0.14, 0],
    left: [0, 0, 0.11],
    right: [0, 0, -0.11],
    tailRoot: [-0.42, 0, 0],
    finTop: [-0.72, 0.2, 0],
    finBottom: [-0.72, -0.2, 0],
  } as const;
  const tris: Array<[readonly number[], readonly number[], readonly number[]]> = [
    [v.nose, v.top, v.left],
    [v.nose, v.left, v.bottom],
    [v.nose, v.bottom, v.right],
    [v.nose, v.right, v.top],
    [v.tailRoot, v.left, v.top],
    [v.tailRoot, v.bottom, v.left],
    [v.tailRoot, v.right, v.bottom],
    [v.tailRoot, v.top, v.right],
    [v.tailRoot, v.finTop, v.finBottom],
    [v.tailRoot, v.finBottom, v.finTop],
  ];
  const positions = new Float32Array(tris.length * 9);
  tris.forEach((tri, i) => {
    tri.forEach((p, j) => positions.set(p, i * 9 + j * 3));
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}
