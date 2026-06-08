"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useLightSourceStore } from "@/effects/lightSourceStore";
import { useQualityStore } from "@/stores/qualityStore";
import { useDisposable } from "@/hooks/useDisposable";

/** The moon: god-ray source #1 (high tier) rising over the forest. */
export function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tier = useQualityStore((s) => s.tier);
  const setSource = useLightSourceStore((s) => s.setGodRaySource);
  const geometry = useMemo(() => new THREE.SphereGeometry(8, 24, 16), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000 }), []);
  useDisposable(geometry, material);

  useEffect(() => {
    if (tier !== "high" || !meshRef.current) return;
    setSource(meshRef.current);
    return () => setSource(null);
  }, [tier, setSource]);

  useFrame(() => {
    const i = uniformProxies.acts.moonIntensity;
    material.color.setRGB(0.85 * i, 0.9 * i, i);
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} position={[35, 78, -170]} />;
}
