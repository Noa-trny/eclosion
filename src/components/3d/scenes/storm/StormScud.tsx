"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createSmokeMaterial } from "@/components/3d/materials/SmokeMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { mulberry32 } from "@/utils/random";

const PUFFS = 14;

/** Scud: ragged low clouds racing under the ceiling — the depth and motion
 *  layer that makes a storm feel alive instead of painted on. */
export function StormScud() {
  const geometry = useMemo(() => {
    const rng = mulberry32(4141);
    const positions = new Float32Array(PUFFS * 4 * 3);
    const centers = new Float32Array(PUFFS * 4 * 3);
    const corners = new Float32Array(PUFFS * 4 * 2);
    const seeds = new Float32Array(PUFFS * 4 * 2);
    const indices: number[] = [];
    const cornerPattern = [-1, -1, 1, -1, 1, 1, -1, 1];
    for (let p = 0; p < PUFFS; p++) {
      const cx = (rng() - 0.5) * 170;
      const cy = (rng() - 0.5) * 10;
      const cz = (rng() - 0.5) * 110;
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
  const material = useMemo(() => {
    const mat = createSmokeMaterial();
    const rise = mat.uniforms.uRise;
    const scale = mat.uniforms.uScale;
    const color = mat.uniforms.uColor;
    if (rise) rise.value = 3;
    if (scale) scale.value = 3.4;
    if (color) (color.value as THREE.Color).setRGB(0.09, 0.1, 0.13);
    return mat;
  }, []);
  useDisposable(geometry, material);

  useFrame(() => {
    const density = material.uniforms.uDensity;
    if (density) density.value = uniformProxies.acts.cloudDensity * 0.9;
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[30, 30, -50]}
      frustumCulled={false}
    />
  );
}
