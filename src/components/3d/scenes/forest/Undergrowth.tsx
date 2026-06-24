"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createFernGeometry } from "@/utils/geometry/fernGeometry";
import { createTreeMaterial } from "@/components/3d/materials/TreeMaterial";
import { createSmokeMaterial } from "@/components/3d/materials/SmokeMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { FOREST_CENTER, FOREST_RADIUS, WATER_LEVEL } from "@/config/world";
import { groundHeight } from "@/utils/terrain";
import { mulberry32 } from "@/utils/random";
import type { Tier } from "@/types/quality";

const FERN_COUNTS: Record<Tier, number> = { high: 1600, medium: 750, low: 220 };
const MIST_PUFFS = 10;

/** The forest floor: instanced fern tufts (sharing TreeMaterial's sway/growth)
 *  and a low creeping mist — the layer that makes the forest feel inhabited. */
export function Undergrowth() {
  const tier = useQualityStore((s) => s.tier);
  const fernMaterial = useMemo(() => createTreeMaterial(), []);

  const ferns = useMemo(() => {
    const count = FERN_COUNTS[tier];
    const geometry = createFernGeometry();
    const mesh = new THREE.InstancedMesh(geometry, fernMaterial, count);
    mesh.frustumCulled = false;
    const rng = mulberry32(7331);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4();
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 15) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * FOREST_RADIUS * 1.05;
      const x = FOREST_CENTER[0] + Math.cos(angle) * radius;
      const z = FOREST_CENTER[1] + Math.sin(angle) * radius;
      const y = groundHeight(x, z);
      if (y < WATER_LEVEL + 0.6) continue;
      pos.set(x, y, z);
      quat.setFromAxisAngle(up, rng() * Math.PI * 2);
      const s = 0.6 + rng() * 1.1;
      scale.set(s, s, s);
      mesh.setMatrixAt(placed, m.compose(pos, quat, scale));
      placed++;
    }
    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [tier, fernMaterial]);

  const mist = useMemo(() => {
    const rng = mulberry32(414);
    const positions = new Float32Array(MIST_PUFFS * 4 * 3);
    const centers = new Float32Array(MIST_PUFFS * 4 * 3);
    const corners = new Float32Array(MIST_PUFFS * 4 * 2);
    const seeds = new Float32Array(MIST_PUFFS * 4 * 2);
    const indices: number[] = [];
    const cornerPattern = [-1, -1, 1, -1, 1, 1, -1, 1];
    for (let p = 0; p < MIST_PUFFS; p++) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * FOREST_RADIUS * 0.9;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;
      const cy = groundHeight(FOREST_CENTER[0] + cx, FOREST_CENTER[1] + cz) + 1.1;
      const s1 = rng();
      const s2 = rng();
      for (let v = 0; v < 4; v++) {
        const idx = p * 4 + v;
        centers[idx * 3] = cx;
        centers[idx * 3 + 1] = cy - groundHeight(FOREST_CENTER[0], FOREST_CENTER[1]);
        centers[idx * 3 + 2] = cz;
        corners[idx * 2] = cornerPattern[v * 2] ?? 0;
        corners[idx * 2 + 1] = cornerPattern[v * 2 + 1] ?? 0;
        seeds[idx * 2] = s1;
        seeds[idx * 2 + 1] = s2;
      }
      const base = p * 4;
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3));
    geo.setAttribute("aCorner", new THREE.BufferAttribute(corners, 2));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 2));
    geo.setIndex(indices);
    const material = createSmokeMaterial();
    const rise = material.uniforms.uRise;
    const scaleU = material.uniforms.uScale;
    const color = material.uniforms.uColor;
    if (rise) rise.value = 2.2;
    if (scaleU) scaleU.value = 1.6;
    if (color) (color.value as THREE.Color).setRGB(0.3, 0.42, 0.46);
    return { geo, material };
  }, []);

  useEffect(() => {
    return () => {
      ferns.geometry.dispose();
      ferns.dispose();
      fernMaterial.dispose();
      mist.geo.dispose();
      mist.material.dispose();
    };
  }, [ferns, fernMaterial, mist]);

  useFrame(() => {
    const growth = fernMaterial.uniforms.uGrowth;
    if (growth) growth.value = uniformProxies.acts.treeGrowth;
    const density = mist.material.uniforms.uDensity;
    if (density) density.value = uniformProxies.acts.fireflyIntensity * 0.5;
  });

  return (
    <group>
      <primitive object={ferns} />
      <mesh
        geometry={mist.geo}
        material={mist.material}
        position={[FOREST_CENTER[0], groundHeight(FOREST_CENTER[0], FOREST_CENTER[1]), FOREST_CENTER[1]]}
        frustumCulled={false}
      />
    </group>
  );
}
