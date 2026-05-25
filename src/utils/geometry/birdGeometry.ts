import * as THREE from "three";

/** Low-poly bird, beak at +x, wings spanning ±z — the flap is a vertex-shader
 *  effect (CreatureMaterial BIRD) with amplitude ∝ |z|. */
export function createBirdGeometry(): THREE.BufferGeometry {
  const body = {
    beak: [0.42, 0, 0],
    top: [0, 0.1, 0],
    bottom: [0, -0.08, 0],
    tail: [-0.4, 0.04, 0],
  } as const;
  const wingSpan = 0.85;
  const tris: Array<[readonly number[], readonly number[], readonly number[]]> = [
    [body.beak, body.top, body.bottom],
    [body.tail, body.bottom, body.top],
    // Left wing (z+), both winding orders so it renders from above and below.
    [[0.12, 0.02, 0.05], [-0.2, 0.02, 0.05], [-0.1, 0.02, wingSpan]],
    // Right wing (z-).
    [[0.12, 0.02, -0.05], [-0.1, 0.02, -wingSpan], [-0.2, 0.02, -0.05]],
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
