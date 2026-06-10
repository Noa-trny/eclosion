"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createWaterMaterial } from "@/components/3d/materials/WaterMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { OCEAN_CENTER, WATER_LEVEL } from "@/config/world";

/** The Gerstner surface over the basin — the camera pierces it at p≈0.50. */
export function WaterSurface() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 240, 130, 100);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const material = useMemo(() => createWaterMaterial(), []);
  useDisposable(geometry, material);

  useFrame(() => {
    const h = material.uniforms.uWaveHeight;
    if (h) h.value = uniformProxies.acts.waveHeight;
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[OCEAN_CENTER[0], WATER_LEVEL, OCEAN_CENTER[1]]}
    />
  );
}
