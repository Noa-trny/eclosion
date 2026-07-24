"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useProgressStore } from "@/stores/progressStore";
import { rollEncounter } from "./roll";
import { useDisposable } from "@/hooks/useDisposable";
import { WATER_LEVEL } from "@/config/world";

/** Global window: the shore approach, before the dive. */
const START = 0.478;
const END = 0.492;
const CHANCE = 0.6;
const FROM = new THREE.Vector3(116, WATER_LEVEL - 0.4, 7);
const TO = new THREE.Vector3(124, WATER_LEVEL - 0.4, 13);

/** One silver fish arcs out of the swell during the approach — a heartbeat
 *  of wild life before the plunge. Blink and it is gone. */
export function FishJump() {
  const appeared = useMemo(() => rollEncounter(CHANCE), []);
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.22, 1.3, 5);
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xd9e6f0, roughness: 0.35, flatShading: true }),
    [],
  );
  useDisposable(geometry, material);
  const prev = useRef(new THREE.Vector3());

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const progress = useProgressStore.getState().progress;
    const u = (progress - START) / (END - START);
    const visible = appeared && u > 0 && u < 1;
    mesh.visible = visible;
    if (!visible) return;
    prev.current.copy(mesh.position);
    const x = FROM.x + (TO.x - FROM.x) * u;
    const z = FROM.z + (TO.z - FROM.z) * u;
    const y = FROM.y + Math.sin(u * Math.PI) * 2.6;
    mesh.position.set(x, y, z);
    // Nose follows the arc.
    if (prev.current.lengthSq() > 0) {
      const dir = mesh.position.clone().sub(prev.current);
      if (dir.lengthSq() > 1e-6) {
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());
      }
    }
  });

  if (!appeared) return null;
  return <mesh ref={meshRef} geometry={geometry} material={material} visible={false} />;
}
