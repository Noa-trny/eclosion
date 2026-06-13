"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getAudioEngine } from "@/audio/engine";

/** Syncs the WebAudio listener to the camera at ~10 Hz. */
export function AudioListenerSync() {
  const accumulator = useRef(0);
  const forward = useRef(new THREE.Vector3()).current;

  useFrame((state, delta) => {
    accumulator.current += delta;
    if (accumulator.current < 0.1) return;
    accumulator.current = 0;
    const engine = getAudioEngine();
    if (!engine) return;
    state.camera.getWorldDirection(forward);
    engine.updateListener(
      { x: state.camera.position.x, y: state.camera.position.y, z: state.camera.position.z },
      { x: forward.x, y: forward.y, z: forward.z },
    );
  });

  return null;
}
