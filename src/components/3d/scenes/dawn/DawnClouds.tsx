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
  // A BAND around the sunrise, not a ceiling: the deck only reads where it
  // catches fire near the sun. Half the old plane = half the screen it fills
  // (the overhead sky was pure raymarch cost with nothing to say).
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 240, 1, 1);
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
    // The dawn deck fills the upper half of the frame staring INTO the sun —
    // no grazing discount applies. Fewer steps here buy the finale its fps;
    // the per-pixel jitter hides the difference.
    if (steps) steps.value = tier === "high" ? 11 : 7;
  });

  if (tier === "low") return null;
  return <mesh geometry={geometry} material={material} position={[566, 88, 64]} frustumCulled={false} />;
}
