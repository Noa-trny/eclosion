"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useQualityStore } from "@/stores/qualityStore";
import { VOLCANO_CENTER, CRATER_RADIUS } from "@/config/world";
import { groundHeight, groundNormal } from "@/utils/terrain";
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
  [300, -31],
  [314, -16],
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
    const normal = { x: 0, y: 1, z: 0 };
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 20) {
      const angle = rng() * Math.PI * 2;
      const radius = CRATER_RADIUS + 11 + Math.pow(rng(), 0.7) * 52;
      const x = VOLCANO_CENTER[0] + Math.cos(angle) * radius;
      const z = VOLCANO_CENTER[1] + Math.sin(angle) * radius;
      if (nearPath(x, z)) continue;
      // Steep ridge flanks are where the analytic ground and the rendered
      // mesh diverge most (and where debris wouldn't rest anyway).
      groundNormal(x, z, normal);
      if (normal.y < 0.62) continue;
      const s = 0.5 + Math.pow(rng(), 2.2) * 2.6;
      const sy = s * (0.5 + rng() * 0.6);
      // Sunk two thirds: the seat survives the mesh's linear interpolation.
      pos.set(x, groundHeight(x, z) + sy * 0.35, z);
      euler.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      quat.setFromEuler(euler);
      scale.set(s * (0.7 + rng() * 0.7), sy, s * (0.7 + rng() * 0.7));
      instanced.setMatrixAt(placed++, m.compose(pos, quat, scale));
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
