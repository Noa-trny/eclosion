"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/** Touch / no-pointer-lock fallback for free-roam: orbit around a point just
 *  ahead of wherever the scroll camera was looking. */
export function OrbitFallbackControls() {
  const camera = useThree((s) => s.camera);
  const target = useMemo(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    return camera.position.clone().addScaledVector(dir, 12);
  }, [camera]);

  return (
    <OrbitControls
      target={target}
      enableDamping
      dampingFactor={0.08}
      maxDistance={120}
      minDistance={2}
    />
  );
}
