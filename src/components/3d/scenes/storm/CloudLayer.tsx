"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createCloudsMaterial } from "@/components/3d/materials/CloudsMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { useQualityStore } from "@/stores/qualityStore";

/** A raymarched slab of FBM density hanging over the storm region.
 *  The raymarch is near-fullscreen fill-rate — the single most expensive
 *  drawer in the film — so the low tier skips it entirely (sky flash + fog
 *  carry the storm's mood on weak GPUs). */
export function CloudLayer() {
  const tier = useQualityStore((s) => s.tier);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(520, 420, 1, 1);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const material = useMemo(() => createCloudsMaterial(), []);
  useDisposable(geometry, material);

  useFrame(() => {
    const d = material.uniforms.uDensity;
    if (d) d.value = uniformProxies.acts.cloudDensity;
    const steps = material.uniforms.uSteps;
    if (steps) steps.value = tier === "high" ? 26 : 16;
  });

  if (tier === "low") return null;
  return <mesh geometry={geometry} material={material} position={[45, 50, -45]} frustumCulled={false} />;
}
