"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sampleCameraPath, type CameraPose } from "@/timelines/cameraPath";
import { uniformProxies } from "@/timelines/uniformProxies";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { useProgressStore } from "@/stores/progressStore";
import { useAppStore } from "@/stores/appStore";
import { damp } from "@/utils/math";

/** Scroll-mode camera: samples the CatmullRom rig at the current progress and
 *  layers damped mouse parallax + act-driven shake on top. Lenis already
 *  smoothed the scroll — no extra positional damping here (see plan §scroll). */
export function CameraRig() {
  const pose = useRef<CameraPose>({
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    fov: 55,
  }).current;
  const parallax = useRef({ x: 0, y: 0 }).current;
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (useAppStore.getState().mode !== "scroll") return;
    const dt = Math.min(delta, 0.05);
    const progress = useProgressStore.getState().progress;
    sampleCameraPath(progress, pose);

    parallax.x = damp(parallax.x, state.pointer.x, 3, dt);
    parallax.y = damp(parallax.y, state.pointer.y, 3, dt);

    const t = sharedUniforms.uTime.value;
    const shake = uniformProxies.camera.shake;
    const shakeX = (Math.sin(t * 13.1) + Math.sin(t * 7.7) * 0.6) * 0.045 * shake;
    const shakeY = (Math.cos(t * 11.3) + Math.sin(t * 17.2) * 0.5) * 0.045 * shake;

    const camera = state.camera as THREE.PerspectiveCamera;
    camera.position.copy(pose.position);
    camera.position.x += shakeX;
    camera.position.y += shakeY;

    look.copy(pose.lookAt);
    look.x += parallax.x * 1.7 + shakeX * 2;
    look.y += parallax.y * 1.0 + shakeY * 2;
    camera.lookAt(look);

    const fov = pose.fov + uniformProxies.camera.fovOffset;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
