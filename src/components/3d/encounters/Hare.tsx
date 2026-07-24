"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useFrame } from "@react-three/fiber";
import { useProgressStore } from "@/stores/progressStore";
import { rollEncounter } from "./roll";
import { useDisposable } from "@/hooks/useDisposable";
import { groundHeight } from "@/utils/terrain";

/** Global window: mid-meadow, while the bloom wave is rolling. */
const START = 0.782;
const END = 0.806;
const CHANCE = 0.6;
const FROM: [number, number] = [356, 44];
const TO: [number, number] = [374, 26];
const HOPS = 7;

/** A hare bounds across the blooming meadow and is gone — the newborn world
 *  already has its wild hearts. */
export function Hare() {
  const appeared = useMemo(() => rollEncounter(CHANCE), []);
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const body = new THREE.SphereGeometry(0.28, 6, 5);
    body.scale(1.35, 1, 0.85);
    const head = new THREE.SphereGeometry(0.16, 6, 5);
    head.translate(0.34, 0.18, 0);
    const earL = new THREE.ConeGeometry(0.05, 0.34, 4);
    earL.translate(0.32, 0.48, 0.06);
    const earR = new THREE.ConeGeometry(0.05, 0.34, 4);
    earR.translate(0.28, 0.48, -0.06);
    const merged = mergeGeometries([body, head, earL, earR], false);
    for (const g of [body, head, earL, earR]) g.dispose();
    return merged ?? new THREE.BufferGeometry();
  }, []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 1, flatShading: true }),
    [],
  );
  useDisposable(geometry, material);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const progress = useProgressStore.getState().progress;
    const u = (progress - START) / (END - START);
    const visible = appeared && u > 0 && u < 1;
    mesh.visible = visible;
    if (!visible) return;
    const x = FROM[0] + (TO[0] - FROM[0]) * u;
    const z = FROM[1] + (TO[1] - FROM[1]) * u;
    // Bounding hops: |sin| arcs over the terrain.
    const hop = Math.abs(Math.sin(u * Math.PI * HOPS));
    mesh.position.set(x, groundHeight(x, z) + 0.25 + hop * 0.8, z);
    mesh.rotation.y = Math.atan2(-(TO[1] - FROM[1]), TO[0] - FROM[0]);
    // Pitch into each leap.
    mesh.rotation.z = Math.cos(u * Math.PI * HOPS) * 0.3;
  });

  if (!appeared) return null;
  return <mesh ref={meshRef} geometry={geometry} material={material} visible={false} />;
}
