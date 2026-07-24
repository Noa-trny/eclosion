"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createFlowerGeometry } from "@/utils/geometry/flowerGeometry";
import { createFlowerMaterial } from "@/components/3d/materials/FlowerMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { MEADOW_CENTER, WATER_LEVEL } from "@/config/world";
import { groundHeight } from "@/utils/terrain";
import { mulberry32 } from "@/utils/random";
import type { Tier } from "@/types/quality";

const COUNTS: Record<Tier, number> = { high: 900, medium: 450, low: 140 };

/** The meadow: instanced corollas that unfurl with the bloom scrub. */
export function Flowers() {
  const tier = useQualityStore((s) => s.tier);
  const count = COUNTS[tier];
  const material = useMemo(() => {
    const mat = createFlowerMaterial();
    const center = mat.uniforms.uCenter;
    if (center) (center.value as THREE.Vector2).set(MEADOW_CENTER[0], MEADOW_CENTER[1]);
    return mat;
  }, []);

  const mesh = useMemo(() => {
    const geometry = createFlowerGeometry();
    const rng = mulberry32(2024);
    const phases = new Float32Array(count);
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4();
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 20) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * 48;
      const x = MEADOW_CENTER[0] + Math.cos(angle) * radius;
      const z = MEADOW_CENTER[1] + Math.sin(angle) * radius;
      const y = groundHeight(x, z);
      if (y < WATER_LEVEL + 0.6) continue;
      pos.set(x, y + 0.06, z);
      quat.setFromAxisAngle(up, rng() * Math.PI * 2);
      const s = 0.8 + rng() * 1.5;
      scale.set(s, s, s);
      instanced.setMatrixAt(placed, m.compose(pos, quat, scale));
      phases[placed] = rng() * Math.PI * 2;
      placed++;
    }
    instanced.count = placed;
    instanced.instanceMatrix.needsUpdate = true;
    // Instances span the meadow; the local bounding sphere would cull them.
    instanced.frustumCulled = false;
    geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    return instanced;
  }, [count, material]);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      material.dispose();
      mesh.dispose();
    };
  }, [mesh, material]);

  useFrame(() => {
    const bloom = material.uniforms.uBloom;
    if (bloom) bloom.value = uniformProxies.acts.bloomMorph;
  });

  return <primitive object={mesh} />;
}
