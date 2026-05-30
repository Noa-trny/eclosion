"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createTreeGeometry } from "@/utils/geometry/treeGeometry";
import { createTreeMaterial } from "@/components/3d/materials/TreeMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { QUALITY_PRESETS } from "@/config/quality";
import { FOREST_CENTER, FOREST_RADIUS, WATER_LEVEL } from "@/config/world";
import { groundHeight } from "@/utils/terrain";
import { mulberry32 } from "@/utils/random";

/** The camera glides between these path anchors — keep a clearing around them. */
const PATH_CLEARANCE: Array<[number, number]> = [
  [-4, -6],
  [-9, -22],
  [-2, -42],
  [0, 0],
];

export function Trees() {
  const tier = useQualityStore((s) => s.tier);
  const variants = useMemo(() => {
    const rng = mulberry32(4242);
    return [createTreeGeometry(rng), createTreeGeometry(rng), createTreeGeometry(rng)];
  }, []);
  const material = useMemo(() => createTreeMaterial(), []);

  const meshes = useMemo(() => {
    const total = QUALITY_PRESETS[tier].treeCount;
    const rng = mulberry32(1337);
    const lists: THREE.Matrix4[][] = [[], [], []];
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let placed = 0;
    let guard = 0;
    while (placed < total && guard++ < total * 25) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * FOREST_RADIUS;
      const x = FOREST_CENTER[0] + Math.cos(angle) * radius;
      const z = FOREST_CENTER[1] + Math.sin(angle) * radius;
      const y = groundHeight(x, z);
      if (y < WATER_LEVEL + 0.6) continue;
      if (PATH_CLEARANCE.some(([px, pz]) => Math.hypot(x - px, z - pz) < 6.5)) continue;
      pos.set(x, y, z);
      quat.setFromAxisAngle(up, rng() * Math.PI * 2);
      const s = 0.7 + rng() * 0.8;
      scale.set(s, s, s);
      const bucket = lists[Math.floor(rng() * 3) % 3];
      bucket?.push(new THREE.Matrix4().compose(pos, quat, scale));
      placed++;
    }
    return lists.map((list, i) => {
      const geometry = variants[i];
      const mesh = new THREE.InstancedMesh(geometry ?? variants[0], material, list.length);
      list.forEach((m, j) => mesh.setMatrixAt(j, m));
      mesh.instanceMatrix.needsUpdate = true;
      // Instances span the world; the local bounding sphere would cull them.
      mesh.frustumCulled = false;
      return mesh;
    });
  }, [tier, variants, material]);

  useEffect(() => {
    return () => {
      for (const mesh of meshes) mesh.dispose();
      for (const geo of variants) geo.dispose();
      material.dispose();
    };
  }, [meshes, variants, material]);

  useFrame(() => {
    const growth = material.uniforms.uGrowth;
    if (growth) growth.value = uniformProxies.acts.treeGrowth;
  });

  return (
    <>
      {meshes.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </>
  );
}
