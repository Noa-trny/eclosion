"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createCloudsMaterial } from "@/components/3d/materials/CloudsMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { useDisposable } from "@/hooks/useDisposable";

/** Sunrise clouds: the same volumetric slab, lit warm from the rising sun —
 *  bellies catching fire as sunriseProgress climbs. */
export function DawnClouds() {
  const tier = useQualityStore((s) => s.tier);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(700, 460, 1, 1);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const material = useMemo(() => {
    const mat = createCloudsMaterial();
    const warm = mat.uniforms.uWarm;
    if (warm) warm.value = 1;
    return mat;
  }, []);
  useDisposable(geometry, material);

  useFrame(() => {
    const density = material.uniforms.uDensity;
    if (density) density.value = uniformProxies.acts.sunriseProgress * 0.8;
    const steps = material.uniforms.uSteps;
    if (steps) steps.value = tier === "high" ? 16 : 9;
  });

  if (tier === "low") return null;
  return <mesh geometry={geometry} material={material} position={[440, 88, 60]} frustumCulled={false} />;
}
