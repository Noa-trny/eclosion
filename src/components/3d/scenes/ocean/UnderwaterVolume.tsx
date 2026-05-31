"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createAuroraMaterial } from "@/components/3d/materials/AuroraMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { OCEAN_CENTER, WATER_LEVEL } from "@/config/world";

const SHAFTS: Array<{ x: number; z: number; rot: number; w: number }> = [
  { x: -18, z: 6, rot: 0.3, w: 26 },
  { x: 8, z: -12, rot: 1.4, w: 34 },
  { x: 26, z: 14, rot: 2.2, w: 22 },
  { x: -2, z: 24, rot: 0.9, w: 30 },
];

/** Light shafts leaning down from the surface (the aurora ribbon, reused). */
export function UnderwaterVolume() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 22, 12, 8), []);
  const material = useMemo(
    () => createAuroraMaterial({ colorA: 0x1fd9c8, colorB: 0x2b6dff, wave: 0.4 }),
    [],
  );
  useDisposable(geometry, material);

  useFrame(() => {
    const i = material.uniforms.uIntensity;
    if (i) i.value = uniformProxies.acts.underwaterLight * 0.55;
  });

  return (
    <group position={[OCEAN_CENTER[0], WATER_LEVEL - 11, OCEAN_CENTER[1]]}>
      {SHAFTS.map((s, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          position={[s.x, 0, s.z]}
          rotation={[0.18, s.rot, 0]}
          scale={[s.w, 1, 1]}
        />
      ))}
    </group>
  );
}
