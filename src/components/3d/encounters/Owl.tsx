"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useProgressStore } from "@/stores/progressStore";
import { rollEncounter } from "./roll";
import { useDisposable } from "@/hooks/useDisposable";

/** Global progress window of the glide (inside the forest act). */
const START = 0.238;
const END = 0.268;
const CHANCE = 0.6;

/** An owl in silhouette, gliding once across the corridor above the walk —
 *  an encounter, not a system. Sometimes you simply miss her. */
export function Owl() {
  const appeared = useMemo(() => rollEncounter(CHANCE), []);
  const groupRef = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const bodyGeometry = useMemo(() => new THREE.ConeGeometry(0.22, 0.9, 5), []);
  const wingGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0, 1.1, 0, 0.34, 1.1, 0, -0.3], 3),
    );
    geo.computeVertexNormals();
    return geo;
  }, []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0x0b0e15, side: THREE.DoubleSide }),
    [],
  );
  useDisposable(bodyGeometry, wingGeometry, material);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const progress = useProgressStore.getState().progress;
    const u = (progress - START) / (END - START);
    const visible = appeared && u > 0 && u < 1;
    group.visible = visible;
    if (!visible) return;
    // A shallow diagonal glide, dipping mid-crossing like a real hunt pass.
    const x = -18 + u * 32;
    const z = -28 - u * 16;
    const y = 11 - Math.sin(u * Math.PI) * 2.4;
    group.position.set(x, y, z);
    group.rotation.y = Math.atan2(32, 18) + Math.PI / 2;
    const flap = Math.sin(clock.elapsedTime * 7) * 0.45;
    if (leftWing.current) leftWing.current.rotation.x = flap;
    if (rightWing.current) rightWing.current.rotation.x = -flap;
  });

  if (!appeared) return null;
  return (
    <group ref={groupRef} visible={false}>
      <mesh geometry={bodyGeometry} material={material} rotation={[0, 0, Math.PI / 2]} />
      <mesh ref={leftWing} geometry={wingGeometry} material={material} position={[0, 0, 0.1]} />
      <mesh
        ref={rightWing}
        geometry={wingGeometry}
        material={material}
        position={[0, 0, -0.1]}
        scale={[1, 1, -1]}
      />
    </group>
  );
}
