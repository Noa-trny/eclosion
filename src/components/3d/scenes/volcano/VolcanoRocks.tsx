"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useQualityStore } from "@/stores/qualityStore";
import { VOLCANO_CENTER, CRATER_RADIUS } from "@/config/world";
import { groundHeight } from "@/utils/terrain";
import { mulberry32 } from "@/utils/random";
import type { Tier } from "@/types/quality";

const COUNTS: Record<Tier, number> = { high: 340, medium: 170, low: 60 };

/** The camera climbs the flank along these anchors — keep a boulder-free
 *  corridor so rocks never fly past the lens like debris. */
const PATH_CLEARANCE: Array<[number, number]> = [
  [216, -12],
  [252, -32],
  [270, -39],
  [286, -46],
  [308, -24],
  [330, 2],
];

function nearPath(x: number, z: number): boolean {
  return PATH_CLEARANCE.some(([px, pz]) => Math.hypot(x - px, z - pz) < 14);
}

/** Scoria scatter: faceted boulders strewn down the flank — the near-field
 *  texture the smooth analytic cone can't provide. */
export function VolcanoRocks() {
  const tier = useQualityStore((s) => s.tier);
  const count = COUNTS[tier];

  const mesh = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x191411,
      roughness: 1,
      flatShading: true,
    });
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    instanced.frustumCulled = false;
    const rng = mulberry32(6060);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3();
    const m = new THREE.Matrix4();
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 20) {
      const angle = rng() * Math.PI * 2;
      const radius = CRATER_RADIUS + 4 + Math.pow(rng(), 0.7) * 58;
      const x = VOLCANO_CENTER[0] + Math.cos(angle) * radius;
      const z = VOLCANO_CENTER[1] + Math.sin(angle) * radius;
      if (nearPath(x, z)) continue;
      const i = placed++;
      const s = 0.5 + Math.pow(rng(), 2.2) * 2.6;
      // Sunk a third into the slope, like debris that rolled and settled.
      pos.set(x, groundHeight(x, z) + s * 0.35, z);
      euler.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      quat.setFromEuler(euler);
      scale.set(s * (0.7 + rng() * 0.7), s * (0.5 + rng() * 0.6), s * (0.7 + rng() * 0.7));
      instanced.setMatrixAt(i, m.compose(pos, quat, scale));
    }
    instanced.count = placed;
    instanced.instanceMatrix.needsUpdate = true;
    return instanced;
  }, [count]);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    };
  }, [mesh]);

  return <primitive object={mesh} />;
}
