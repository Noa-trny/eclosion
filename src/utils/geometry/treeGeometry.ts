import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { randRange } from "@/utils/random";

function paint(geo: THREE.BufferGeometry, color: [number, number, number], jitter: number, rng: () => number): void {
  const count = geo.attributes.position?.count ?? 0;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const j = 1 + (rng() - 0.5) * jitter;
    colors[i * 3] = color[0] * j;
    colors[i * 3 + 1] = color[1] * j;
    colors[i * 3 + 2] = color[2] * j;
  }
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
}

/** One procedural conifer: tapered trunk + stacked noise-jittered canopy
 *  cones, merged with a per-vertex aColor attribute (trunk vs foliage). */
export function createTreeGeometry(rng: () => number): THREE.BufferGeometry {
  const height = randRange(rng, 4.5, 8);
  const trunkH = height * 0.42;
  const parts: THREE.BufferGeometry[] = [];

  const trunk = new THREE.CylinderGeometry(0.09, 0.24, trunkH, 6, 1);
  trunk.translate(0, trunkH / 2, 0);
  paint(trunk, [0.16, 0.1, 0.06], 0.3, rng);
  parts.push(trunk);

  const layers = 3;
  for (let l = 0; l < layers; l++) {
    const t = l / (layers - 1);
    const radius = randRange(rng, 1.3, 1.8) * (1 - t * 0.55);
    const coneH = height * 0.34;
    const cone = new THREE.ConeGeometry(radius, coneH, 7, 1);
    cone.translate(
      (rng() - 0.5) * 0.25,
      trunkH * 0.8 + t * (height - trunkH) + coneH * 0.4,
      (rng() - 0.5) * 0.25,
    );
    paint(cone, [0.06 + t * 0.03, 0.2 + t * 0.06, 0.1 + t * 0.03], 0.45, rng);
    parts.push(cone);
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  return merged ?? new THREE.BufferGeometry();
}
