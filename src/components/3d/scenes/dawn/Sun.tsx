"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useLightSourceStore } from "@/effects/lightSourceStore";
import { useQualityStore } from "@/stores/qualityStore";
import { useDisposable } from "@/hooks/useDisposable";
import { SUN_ANCHOR } from "@/config/world";

/** The rising sun: god-ray source #2, climbing with sunriseProgress. */
export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tier = useQualityStore((s) => s.tier);
  const setSource = useLightSourceStore((s) => s.setGodRaySource);
  const geometry = useMemo(() => new THREE.SphereGeometry(10, 24, 16), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000 }), []);
  useDisposable(geometry, material);

  useEffect(() => {
    if (tier !== "high" || !meshRef.current) return;
    setSource(meshRef.current);
    return () => setSource(null);
  }, [tier, setSource]);

  useFrame(() => {
    const rise = uniformProxies.acts.sunriseProgress;
    // Bright enough to bloom, capped so the frame never fully whites out.
    material.color.setRGB(0.75 * rise, 0.48 * rise, 0.26 * rise);
    if (meshRef.current) {
      meshRef.current.position.set(SUN_ANCHOR[0], SUN_ANCHOR[1] - 55 + rise * 75, SUN_ANCHOR[2]);
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} position={[...SUN_ANCHOR]} />;
}
