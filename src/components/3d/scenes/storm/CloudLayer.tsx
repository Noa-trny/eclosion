"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createCloudsMaterial } from "@/components/3d/materials/CloudsMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

/** A raymarched slab of FBM density hanging over the storm region. */
export function CloudLayer() {
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
  });

  return <mesh geometry={geometry} material={material} position={[45, 50, -45]} frustumCulled={false} />;
}
