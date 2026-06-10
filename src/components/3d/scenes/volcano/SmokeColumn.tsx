"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createSmokeMaterial } from "@/components/3d/materials/SmokeMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { VOLCANO_CENTER } from "@/config/world";
import { groundHeight } from "@/utils/terrain";
import { mulberry32 } from "@/utils/random";

const PUFFS = 18;

/** Billboard puff quads looping a rise cycle above the crater. */
export function SmokeColumn() {
  const geometry = useMemo(() => {
    const rng = mulberry32(93);
    const positions = new Float32Array(PUFFS * 4 * 3);
    const centers = new Float32Array(PUFFS * 4 * 3);
    const corners = new Float32Array(PUFFS * 4 * 2);
    const seeds = new Float32Array(PUFFS * 4 * 2);
    const indices: number[] = [];
    const cornerPattern = [-1, -1, 1, -1, 1, 1, -1, 1];
    for (let p = 0; p < PUFFS; p++) {
      const cx = (rng() - 0.5) * 9;
      const cy = rng() * 4;
      const cz = (rng() - 0.5) * 9;
      const s1 = rng();
      const s2 = rng();
      for (let v = 0; v < 4; v++) {
        const idx = p * 4 + v;
        centers[idx * 3] = cx;
        centers[idx * 3 + 1] = cy;
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
    return geo;
  }, []);
  const material = useMemo(() => createSmokeMaterial(), []);
  useDisposable(geometry, material);
  const baseY = useMemo(() => groundHeight(VOLCANO_CENTER[0], VOLCANO_CENTER[1]) + 4, []);

  useFrame(() => {
    const d = material.uniforms.uDensity;
    if (d) d.value = uniformProxies.acts.smokeDensity;
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[VOLCANO_CENTER[0], baseY, VOLCANO_CENTER[1]]}
      frustumCulled={false}
    />
  );
}
