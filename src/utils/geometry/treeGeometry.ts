import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { randRange } from "@/utils/random";

function paint(geo: THREE.BufferGeometry, color: [number, number, number]): void {
  const count = geo.attributes.position?.count ?? 0;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = color[0];
    colors[i * 3 + 1] = color[1];
    colors[i * 3 + 2] = color[2];
  }
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
}

/** Tears the cone's base ring so the tier reads as living branches, not CAD. */
function ragRim(cone: THREE.ConeGeometry, coneH: number, rng: () => number): void {
  const pos = cone.attributes.position;
  if (!pos) return;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) < -coneH / 2 + 0.01) {
      const spread = 0.82 + rng() * 0.4;
      pos.setX(i, pos.getX(i) * spread);
      pos.setZ(i, pos.getZ(i) * spread);
      pos.setY(i, pos.getY(i) + (rng() - 0.5) * coneH * 0.3);
    }
  }
  pos.needsUpdate = true;
}

/** One procedural conifer — two archetypes (slender fir / full spruce), ragged
 *  tier skirts, flat-faceted shading and painterly per-face color: the
 *  low-poly-art tree, not the toy cone stack. */
export function createTreeGeometry(rng: () => number): THREE.BufferGeometry {
  const slender = rng() < 0.45;
  const height = slender ? randRange(rng, 6.5, 10) : randRange(rng, 4.5, 7.5);
  const trunkH = height * (slender ? 0.34 : 0.3);
  const baseR = slender ? randRange(rng, 1.05, 1.4) : randRange(rng, 1.6, 2.1);
  const tiers = slender ? 5 : 4;
  const parts: THREE.BufferGeometry[] = [];

  const trunk = new THREE.CylinderGeometry(0.09, 0.26, trunkH, 6, 1);
  trunk.translate(0, trunkH / 2, 0);
  paint(trunk, [0.16, 0.1, 0.06]);
  parts.push(trunk);

  // Per-tree hue roll: some trees drift olive, others teal — a forest is
  // never one green.
  const hueShift = rng() - 0.5;
  const canopyH = height - trunkH * 0.55;
  for (let l = 0; l < tiers; l++) {
    const t = l / (tiers - 1);
    const radius = baseR * (1 - t * 0.66) * (0.88 + rng() * 0.24);
    const coneH = (canopyH / tiers) * randRange(rng, 1.45, 1.75);
    const cone = new THREE.ConeGeometry(radius, coneH, slender ? 7 : 8, 1);
    ragRim(cone, coneH, rng);
    cone.rotateY(rng() * Math.PI * 2);
    cone.translate(
      (rng() - 0.5) * 0.3 * (1 - t),
      trunkH * 0.55 + t * (canopyH - coneH * 0.7) + coneH * 0.42,
      (rng() - 0.5) * 0.3 * (1 - t),
    );
    // Upper tiers catch the moon: paler, cooler tips.
    paint(cone, [
      0.05 + t * 0.045 + Math.max(0, hueShift) * 0.05,
      0.15 + t * 0.1,
      0.09 + t * 0.055 + Math.max(0, -hueShift) * 0.06,
    ]);
    parts.push(cone);
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!merged) return new THREE.BufferGeometry();

  // Flat facets: unshare vertices, recompute face normals, then paint each
  // FACE with its own light jitter — the painterly patchwork that sells
  // stylized foliage.
  const faceted = merged.toNonIndexed();
  merged.dispose();
  faceted.computeVertexNormals();
  const colors = faceted.attributes.aColor;
  if (colors) {
    for (let f = 0; f < colors.count; f += 3) {
      const jitter = 1 + (rng() - 0.5) * 0.42;
      for (let v = 0; v < 3; v++) {
        colors.setXYZ(
          f + v,
          colors.getX(f + v) * jitter,
          colors.getY(f + v) * jitter,
          colors.getZ(f + v) * jitter,
        );
      }
    }
    colors.needsUpdate = true;
  }
  return faceted;
}
