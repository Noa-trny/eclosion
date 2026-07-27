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
 *  layers damped mouse parallax + act-driven shake on top. Lenis smooths the
 *  scroll VALUE; the light spatial damping below (λ=9, ~0.1s of lag) rounds
 *  the velocity seams where one act's curve segment hands over to the next. */
export function CameraRig() {
  const pose = useRef<CameraPose>({
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    fov: 55,
  }).current;
  const parallax = useRef({ x: 0, y: 0 }).current;
  const look = useMemo(() => new THREE.Vector3(), []);
  const smoothPos = useMemo(() => new THREE.Vector3(), []);
  const smoothLook = useMemo(() => new THREE.Vector3(), []);
  const wasScroll = useRef(false);
  const breath = useRef(1);

  useFrame((state, delta) => {
    if (useAppStore.getState().mode !== "scroll") {
      wasScroll.current = false;
      return;
    }
    const dt = Math.min(delta, 0.05);
    const progress = useProgressStore.getState().progress;
    sampleCameraPath(progress, pose);

    // Snap the smoothing on (re)entry so free-roam handoffs never drift-fight.
    if (!wasScroll.current) {
      wasScroll.current = true;
      smoothPos.copy(pose.position);
      smoothLook.copy(pose.lookAt);
    }
    const blend = 1 - Math.exp(-9 * dt);
    smoothPos.lerp(pose.position, blend);
    smoothLook.lerp(pose.lookAt, blend);

    parallax.x = damp(parallax.x, state.pointer.x, 3, dt);
    parallax.y = damp(parallax.y, state.pointer.y, 3, dt);

    const t = sharedUniforms.uTime.value;
    // Lightning kicks the camera — the strike is FELT, not just seen.
    const shake = uniformProxies.camera.shake + sharedUniforms.uFlash.value * 0.35;
    const shakeX = (Math.sin(t * 13.1) + Math.sin(t * 7.7) * 0.6) * 0.045 * shake;
    const shakeY = (Math.cos(t * 11.3) + Math.sin(t * 17.2) * 0.5) * 0.045 * shake;

    const camera = state.camera as THREE.PerspectiveCamera;
    camera.position.copy(smoothPos);
    camera.position.x += shakeX;
    camera.position.y += shakeY;

    // Before entry, the opening shot BREATHES — a slow orbital drift behind
    // the gate's veil, so the world is alive before the first scroll. Damped
    // out after entry so the handover to the scroll never pops.
    const started = useAppStore.getState().started;
    breath.current += ((started ? 0 : 1) - breath.current) * (1 - Math.exp(-0.8 * dt));
    if (breath.current > 0.003) {
      camera.position.x += Math.sin(t * 0.11) * 1.6 * breath.current;
      camera.position.y += Math.sin(t * 0.07 + 1.3) * 0.7 * breath.current;
      camera.position.z += Math.cos(t * 0.09) * 1.1 * breath.current;
    }

    look.copy(smoothLook);
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
