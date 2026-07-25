"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAppStore } from "@/stores/appStore";
import { groundHeight } from "@/utils/terrain";

const FALL_SECONDS = 7.5;
const START_Y = 38;
const X = 452;
const Z = 64;

/** The secret's heart: one glowing seed drifts down through the dawn sky and
 *  lands in the meadow — the story closing its own loop. */
export function FallingSeed() {
  const secretActive = useAppStore((s) => s.secretActive);
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const startTime = useRef<number | null>(null);
  const landY = useMemo(() => groundHeight(X, Z) + 0.4, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const light = lightRef.current;
    if (!mesh || !light) return;
    if (!secretActive) {
      startTime.current = null;
      mesh.visible = false;
      // Invisible lights leave the render list entirely — a dormant point
      // light must not tax every dawn frame.
      light.visible = false;
      return;
    }
    light.visible = true;
    if (startTime.current === null) startTime.current = clock.elapsedTime;
    const t = clock.elapsedTime - startTime.current;
    const fall = Math.min(1, t / FALL_SECONDS);
    // Ease-out drop with a gentle sideways breath, like a petal in still air.
    const eased = 1 - Math.pow(1 - fall, 2.2);
    const y = START_Y + (landY - START_Y) * eased;
    const sway = Math.sin(t * 0.9) * 1.6 * (1 - eased);
    mesh.visible = true;
    mesh.position.set(X + sway, y, Z + Math.cos(t * 0.7) * 1.1 * (1 - eased));
    light.position.copy(mesh.position);
    // Pulse on landing, then a settled ember glow.
    const landed = t - FALL_SECONDS;
    light.intensity = landed < 0 ? 2.2 : 2.2 + Math.max(0, 5 - landed * 4) + Math.sin(t * 2.4) * 0.5;
  });

  return (
    <group>
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color={0xffe7c0} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color={0xffb066} distance={40} decay={1.8} intensity={0} />
    </group>
  );
}
