"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { groundHeight } from "@/utils/terrain";
import { useDisposable } from "@/hooks/useDisposable";
import { GlowingSeed } from "./GlowingSeed";
import { Roots } from "./Roots";

/** Act 1 — the seed on its mound at the world origin. */
export function SeedScene() {
  const baseY = useMemo(() => groundHeight(0, 0), []);
  const moundGeometry = useMemo(() => new THREE.SphereGeometry(2.6, 24, 16), []);
  const moundMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x14100a, roughness: 1 }),
    [],
  );
  useDisposable(moundGeometry, moundMaterial);

  return (
    <group position={[0, baseY, 0]}>
      <mesh geometry={moundGeometry} material={moundMaterial} scale={[1, 0.35, 1]} position={[0, 0.1, 0]} />
      <group position={[0, 1.35, 0]}>
        <GlowingSeed />
        <Roots />
      </group>
    </group>
  );
}
