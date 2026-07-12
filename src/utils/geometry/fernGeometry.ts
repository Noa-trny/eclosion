import * as THREE from "three";

/** One fern tuft: 6 arched blades fanning out from the base, with an aColor
 *  vertex attribute (dark base → brighter tip) so it shares TreeMaterial
 *  (instancing + wind sway + growth + fog + moon rim). */
export function createFernGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const blades = 6;
  const segments = 3;

  for (let b = 0; b < blades; b++) {
    const angle = (b / blades) * Math.PI * 2 + (b % 2) * 0.35;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const lean = 0.55 + (b % 3) * 0.12;
    const length = 0.75 + (b % 2) * 0.25;
    const width = 0.085;

    for (let s = 0; s < segments; s++) {
      const t0 = s / segments;
      const t1 = (s + 1) / segments;
      // Arched spine: rises then droops toward the tip.
      const point = (t: number, side: number): [number, number, number] => [
        dx * t * length * lean + -dz * width * (1 - t) * side,
        Math.sin(t * Math.PI * 0.62) * length * 0.9,
        dz * t * length * lean + dx * width * (1 - t) * side,
      ];
      const shade = (t: number): [number, number, number] => [
        0.04 + t * 0.05,
        0.13 + t * 0.14,
        0.07 + t * 0.06,
      ];
      const a = point(t0, -1);
      const c = point(t0, 1);
      const d = point(t1, -1);
      const e = point(t1, 1);
      positions.push(...a, ...d, ...c, ...c, ...d, ...e);
      const s0 = shade(t0);
      const s1 = shade(t1);
      colors.push(...s0, ...s1, ...s0, ...s0, ...s1, ...s1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(colors), 3));
  geo.computeVertexNormals();
  return geo;
}
