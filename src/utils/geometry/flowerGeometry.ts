import * as THREE from "three";

/** A 6-petal corolla built open; FlowerMaterial folds it closed via aTip and
 *  unfurls it with the bloom scrub. aTip: 0 at the center, 1 at petal tips. */
export function createFlowerGeometry(petals = 6): THREE.BufferGeometry {
  const positions: number[] = [];
  const tips: number[] = [];

  const pushTri = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number],
    ta: number,
    tb: number,
    tc: number,
  ): void => {
    positions.push(...a, ...b, ...c);
    tips.push(ta, tb, tc);
  };

  // Center disc.
  const centerR = 0.09;
  for (let i = 0; i < petals; i++) {
    const a0 = (i / petals) * Math.PI * 2;
    const a1 = ((i + 1) / petals) * Math.PI * 2;
    pushTri(
      [0, 0.02, 0],
      [Math.cos(a0) * centerR, 0.02, Math.sin(a0) * centerR],
      [Math.cos(a1) * centerR, 0.02, Math.sin(a1) * centerR],
      0,
      0.08,
      0.08,
    );
  }

  // Petals: two quads (4 tris) each, gently lifted toward the tip.
  const len = 0.42;
  const width = 0.15;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const px = -dz;
    const pz = dx;
    const at = (t: number, w: number): [number, number, number] => [
      dx * (centerR + t * len) + px * w,
      0.02 + t * t * 0.06,
      dz * (centerR + t * len) + pz * w,
    ];
    const base0 = at(0, -width * 0.4);
    const base1 = at(0, width * 0.4);
    const mid0 = at(0.55, -width);
    const mid1 = at(0.55, width);
    const tip = at(1, 0);
    pushTri(base0, mid0, base1, 0.1, 0.55, 0.1);
    pushTri(base1, mid0, mid1, 0.1, 0.55, 0.55);
    pushTri(mid0, tip, mid1, 0.55, 1, 0.55);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("aTip", new THREE.BufferAttribute(new Float32Array(tips), 1));
  geo.computeVertexNormals();
  return geo;
}
