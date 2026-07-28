"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useLightSourceStore } from "@/effects/lightSourceStore";
import { useDisposable } from "@/hooks/useDisposable";
import { SUN_ANCHOR } from "@/config/world";
import { smootherstep } from "@/utils/math";

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
 *  persistent source ⇒ the pass is built once, behind the loading ring.
 *
 *  Scene fog is OFF on the material: at the crest beat the sun sits ~155
 *  units out, where FogExp2 keeps 0.5% of the surface color — the disc
 *  rendered as a grey coin no matter what it was painted (and the material
 *  toggling fog at runtime would recompile its program). The sun legitimately
 *  outshines the atmosphere; the moon gets the SAME FogExp2 math re-applied
 *  in JS below, so its shipped look survives to the pixel. */
export function Celestial() {
  const meshRef = useRef<THREE.Mesh>(null);
  const setSource = useLightSourceStore((s) => s.setGodRaySource);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 24, 16), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }), []);
  const viewPos = useMemo(() => new THREE.Vector3(), []);
  useDisposable(geometry, material);

  useEffect(() => {
    if (!meshRef.current) return;
    setSource(meshRef.current);
    return () => setSource(null);
  }, [setSource]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const moon = uniformProxies.acts.moonIntensity;
    const rise = uniformProxies.acts.sunriseProgress;
    if (rise > 0.001) {
      mesh.scale.setScalar(SUN_RADIUS);
      mesh.position.set(SUN_ANCHOR[0], SUN_ANCHOR[1] - 55 + rise * 75, SUN_ANCHOR[2]);
      // The disc must CROSS the bloom threshold (0.62 luma) to glow — the old
      // cap of (0.75, 0.48, 0.26) peaked at ~0.54 and never did, leaving a
      // matte coin darker than the dawn sky behind it. And the whole climb
      // happens in the FIRST third of the rise: the disc is already cresting
      // at rise≈0.15, so a curve keyed on full rise reads as an eclipse. Deep
      // ember below the horizon, golden the moment it shows, cream past 1 at
      // the top (HalfFloat buffer) — bloom and god rays feed on the same
      // radiance.
      const ignite = smootherstep(0, 0.35, rise);
      material.color.setRGB(
        0.55 + 0.85 * ignite,
        0.3 + 0.85 * ignite,
        0.12 + 0.73 * ignite,
      );
      mesh.visible = true;
    } else {
      mesh.scale.setScalar(MOON_RADIUS);
      mesh.position.set(MOON_POSITION[0], MOON_POSITION[1], MOON_POSITION[2]);
      // Same numbers FogExp2 would have produced with fog enabled — the moon
      // must keep belonging to the night air (mix toward fog color by view
      // depth), only the sun pierces it.
      const fog = uniformProxies.fog;
      const depth = -viewPos.copy(mesh.position).applyMatrix4(state.camera.matrixWorldInverse).z;
      const keep = Math.exp(-((fog.density * depth) ** 2));
      material.color.setRGB(
        fog.color.r + (0.85 * moon - fog.color.r) * keep,
        fog.color.g + (0.9 * moon - fog.color.g) * keep,
        fog.color.b + (moon - fog.color.b) * keep,
      );
      // Unlit it would still be a black disc occluding the stars — hide it
      // outside its acts, as the per-act mounting used to do.
      mesh.visible = moon > 0.002;
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} position={[...MOON_POSITION]} visible={false} />;
}
