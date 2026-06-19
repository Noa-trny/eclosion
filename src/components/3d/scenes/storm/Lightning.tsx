"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { getAudioEngine } from "@/audio/engine";

/** Randomized strikes: a sky-wide flash (uFlash, read by the sky/cloud
 *  shaders), a decaying point light, and a distance-delayed thunder clap. */
export function Lightning() {
  const lightRef = useRef<THREE.PointLight>(null);
  const countdown = useRef(2.5);
  const restrike = useRef(0);

  useFrame((_, delta) => {
    const light = lightRef.current;
    if (!light) return;
    const dt = Math.min(delta, 0.05);
    light.intensity *= Math.exp(-8 * dt);
    // The double-strike flicker that makes lightning feel real.
    if (restrike.current > 0) {
      restrike.current -= dt;
      if (restrike.current <= 0) {
        sharedUniforms.uFlash.value = 0.5 + Math.random() * 0.4;
        light.intensity = 800;
      }
    }
    const activity = uniformProxies.acts.lightningActivity;
    if (activity < 0.05) return;
    countdown.current -= dt;
    if (countdown.current > 0) return;
    countdown.current = 0.9 + (Math.random() * 3.2) / activity;
    sharedUniforms.uFlash.value = 0.85 + Math.random() * 0.35;
    light.position.set(
      20 + (Math.random() - 0.5) * 140,
      38 + Math.random() * 18,
      -55 + (Math.random() - 0.5) * 120,
    );
    light.intensity = 1400;
    if (Math.random() < 0.35) restrike.current = 0.12;
    getAudioEngine()?.thunder();
  });

  return <pointLight ref={lightRef} color={0xbfd0ff} distance={280} decay={1.6} intensity={0} />;
}
