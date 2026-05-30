"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createSeedGeometry } from "@/utils/geometry/seedGeometry";
import { createGlowSeedMaterial } from "@/components/3d/materials/GlowSeedMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

/** The seed: pulsing husk that cracks open (uGerm) while a sprout unfurls. */
export function GlowingSeed() {
  const geometry = useMemo(() => createSeedGeometry(), []);
  const material = useMemo(() => createGlowSeedMaterial(), []);
  const sproutGeometry = useMemo(() => new THREE.ConeGeometry(0.06, 1.1, 6), []);
  const sproutMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x2f8f4a, emissive: 0x1a5c2c, emissiveIntensity: 0.4, roughness: 0.7 }),
    [],
  );
  useDisposable(geometry, material, sproutGeometry, sproutMaterial);
  const lightRef = useRef<THREE.PointLight>(null);
  const sproutRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const { seedGlow, germination } = uniformProxies.acts;
    const glow = material.uniforms.uGlow;
    const germ = material.uniforms.uGerm;
    if (glow) glow.value = seedGlow;
    if (germ) germ.value = germination;
    if (lightRef.current) {
      lightRef.current.intensity = seedGlow * 5 + germination * 4;
    }
    if (sproutRef.current) {
      const s = Math.max(germination, 0.001);
      sproutRef.current.scale.set(s, s, s);
      sproutRef.current.position.y = 0.55 + germination * 0.7;
    }
  });

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <mesh ref={sproutRef} geometry={sproutGeometry} material={sproutMaterial} position={[0, 0.55, 0]} />
      <pointLight ref={lightRef} color={0xffb85c} distance={30} decay={1.8} intensity={0} />
    </group>
  );
}
