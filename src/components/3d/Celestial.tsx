"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useLightSourceStore } from "@/effects/lightSourceStore";
import { useDisposable } from "@/hooks/useDisposable";
import { SUN_ANCHOR } from "@/config/world";

/** World space — act groups carry no transform of their own. */
const MOON_POSITION: readonly [number, number, number] = [35, 78, -170];
const MOON_RADIUS = 8;
const SUN_RADIUS = 10;

/** The ONE celestial body of the film: the moon over the forest, then the
 *  rising sun of the dawn — the timeline never lights both at once.
 *
 *  It lives for the whole session, unlike the per-act meshes it replaces,
 *  because the god-rays pass needs a light source AT BOOT: when each act
 *  registered its own mesh on mount, the composer's `key` changed mid-scroll
 *  and the whole post chain recompiled — a ~500ms frozen frame right as the
 *  forest appeared (and again at its unmount, and again at dawn). One
 *  persistent source ⇒ the pass is built once, behind the loading ring. */
export function Celestial() {
  const meshRef = useRef<THREE.Mesh>(null);
  const setSource = useLightSourceStore((s) => s.setGodRaySource);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 24, 16), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000 }), []);
  useDisposable(geometry, material);

  useEffect(() => {
    if (!meshRef.current) return;
    setSource(meshRef.current);
    return () => setSource(null);
  }, [setSource]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const moon = uniformProxies.acts.moonIntensity;
    const rise = uniformProxies.acts.sunriseProgress;
    if (rise > 0.001) {
      mesh.scale.setScalar(SUN_RADIUS);
      mesh.position.set(SUN_ANCHOR[0], SUN_ANCHOR[1] - 55 + rise * 75, SUN_ANCHOR[2]);
      material.color.setRGB(0.75 * rise, 0.48 * rise, 0.26 * rise);
      mesh.visible = true;
    } else {
      mesh.scale.setScalar(MOON_RADIUS);
      mesh.position.set(MOON_POSITION[0], MOON_POSITION[1], MOON_POSITION[2]);
      material.color.setRGB(0.85 * moon, 0.9 * moon, moon);
      // Unlit it would still be a black disc occluding the stars — hide it
      // outside its acts, as the per-act mounting used to do.
      mesh.visible = moon > 0.002;
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} position={[...MOON_POSITION]} visible={false} />;
}
