"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { groundHeight } from "@/utils/terrain";
import { useDisposable } from "@/hooks/useDisposable";
import { mulberry32 } from "@/utils/random";
import { GlowingSeed } from "./GlowingSeed";
import { Roots } from "./Roots";

/** Act 1 — the seed on its cairn at the world origin. The mound is faceted
 *  earth ringed by standing stones: the style is OWNED, not a naked sphere. */
export function SeedScene() {
  const baseY = useMemo(() => groundHeight(0, 0), []);
  const moundGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.6, 2);
    const rng = mulberry32(77);
    const pos = geo.attributes.position;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const scale = 1 + (rng() - 0.5) * 0.24;
        pos.setXYZ(i, pos.getX(i) * scale, pos.getY(i) * scale, pos.getZ(i) * scale);
      }
      pos.needsUpdate = true;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  const moundMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x161009, roughness: 1, flatShading: true }),
    [],
  );
  const stoneGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.3, 0), []);
  const stoneMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x1c1812, roughness: 1, flatShading: true }),
    [],
  );
  const stones = useMemo(() => {
    const rng = mulberry32(31);
    return Array.from({ length: 11 }, (_, i) => {
      const angle = (i / 11) * Math.PI * 2 + rng() * 0.4;
      const radius = 3.1 + rng() * 0.9;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return {
        position: [x, groundHeight(x, z) - baseY + 0.08, z] as [number, number, number],
        rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI] as [number, number, number],
        scale: 0.6 + rng() * 1.1,
      };
    });
  }, [baseY]);
  useDisposable(moundGeometry, moundMaterial, stoneGeometry, stoneMaterial);

  return (
    <group position={[0, baseY, 0]}>
      <mesh geometry={moundGeometry} material={moundMaterial} scale={[1, 0.38, 1]} position={[0, 0.1, 0]} />
      {stones.map((stone, i) => (
        <mesh
          key={i}
          geometry={stoneGeometry}
          material={stoneMaterial}
          position={stone.position}
          rotation={stone.rotation}
          scale={stone.scale}
        />
      ))}
      <group position={[0, 1.35, 0]}>
        <GlowingSeed />
        <Roots />
      </group>
    </group>
  );
}
