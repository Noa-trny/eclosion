"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mulberry32 } from "@/utils/random";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

const ROOT_COUNT = 6;

/** Roots as noise-walked tubes growing via an animated index draw range. */
export function Roots() {
  const geometries = useMemo(() => {
    const rng = mulberry32(1103);
    const tubes: THREE.TubeGeometry[] = [];
    for (let r = 0; r < ROOT_COUNT; r++) {
      const points: THREE.Vector3[] = [new THREE.Vector3(0, 0.2, 0)];
      const angle = (r / ROOT_COUNT) * Math.PI * 2 + rng() * 0.8;
      let x = 0;
      let y = 0.2;
      let z = 0;
      for (let i = 0; i < 8; i++) {
        x += Math.cos(angle + Math.sin(i * 1.7 + r) * 0.9) * (0.35 + rng() * 0.4);
        z += Math.sin(angle + Math.cos(i * 1.3 + r) * 0.9) * (0.35 + rng() * 0.4);
        y -= 0.32 + rng() * 0.3;
        points.push(new THREE.Vector3(x, y, z));
      }
      tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.05 + rng() * 0.03, 5, false));
    }
    return tubes;
  }, []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x2a1708, roughness: 0.95 }),
    [],
  );
  useDisposable(...geometries, material);

  useFrame(() => {
    const growth = uniformProxies.acts.rootsGrowth;
    for (const geo of geometries) {
      const indexCount = geo.index?.count ?? 0;
      // Snap to whole triangles so partial tubes never render torn faces.
      geo.setDrawRange(0, Math.floor((indexCount * growth) / 3) * 3);
    }
  });

  return (
    <group>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={material} />
      ))}
    </group>
  );
}
