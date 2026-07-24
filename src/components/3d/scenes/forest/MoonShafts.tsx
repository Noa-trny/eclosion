"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createAuroraMaterial } from "@/components/3d/materials/AuroraMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

/** Hand-placed along the glide corridor (camera x -8..-2, z -6..-44), each
 *  leaning toward the moon at [35, 78, -170] — its light made solid. */
const SHAFTS: Array<{ x: number; z: number; rot: number; w: number; phase: number }> = [
  // Wide soft curtains (like the underwater cathedral) — narrow planes fold
  // the aurora pattern into ugly chevrons.
  { x: -12, z: -16, rot: 0.4, w: 12, phase: 0 },
  { x: 4, z: -24, rot: 1.3, w: 16, phase: 1.6 },
  { x: -10, z: -34, rot: 2.1, w: 10, phase: 3.1 },
  { x: 0, z: -44, rot: 0.9, w: 14, phase: 4.5 },
];

/** Moonlight shafts slanting through the canopy — silver pillars the camera
 *  glides between, breathing slowly out of phase like the underwater
 *  cathedral, but cold and still. */
export function MoonShafts() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 17, 8, 6), []);
  const materials = useMemo(
    () =>
      SHAFTS.map(() =>
        createAuroraMaterial({ colorA: 0xcfdfff, colorB: 0x7c96e0, wave: 0.3 }),
      ),
    [],
  );
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  useDisposable(geometry, ...materials);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const moon = uniformProxies.acts.moonIntensity;
    for (let i = 0; i < SHAFTS.length; i++) {
      const def = SHAFTS[i];
      const material = materials[i];
      if (!def || !material) continue;
      const intensity = material.uniforms.uIntensity;
      const breathe = 0.6 + 0.4 * Math.sin(t * 0.09 + def.phase) * Math.sin(t * 0.05 + def.phase * 1.9);
      if (intensity) intensity.value = moon * 0.45 * (0.5 + 0.5 * breathe);
      const mesh = meshRefs.current[i];
      // A slow sway, as if the canopy above kept re-carving the light.
      if (mesh) mesh.rotation.z = -0.22 + Math.sin(t * 0.05 + def.phase) * 0.04;
    }
  });

  return (
    <group>
      {SHAFTS.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          geometry={geometry}
          material={materials[i]}
          position={[s.x, 8.5, s.z]}
          rotation={[0.08, s.rot, -0.22]}
          scale={[s.w, 1, 1]}
        />
      ))}
    </group>
  );
}
