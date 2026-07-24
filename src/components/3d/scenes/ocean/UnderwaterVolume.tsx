"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createAuroraMaterial } from "@/components/3d/materials/AuroraMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { OCEAN_CENTER, WATER_LEVEL } from "@/config/world";

/** Nine shafts leaning toward one bright point at the surface — a cathedral,
 *  not a scatter. Each has its own material so intensity/sway can breathe
 *  out of phase, like light through a moving swell. */
const SHAFTS: Array<{ x: number; z: number; rot: number; w: number; phase: number }> = [
  { x: -18, z: 6, rot: 0.3, w: 26, phase: 0.0 },
  { x: 8, z: -12, rot: 1.4, w: 34, phase: 1.7 },
  { x: 26, z: 14, rot: 2.2, w: 22, phase: 3.1 },
  { x: -2, z: 24, rot: 0.9, w: 30, phase: 4.4 },
  { x: -28, z: -8, rot: 1.9, w: 18, phase: 0.9 },
  { x: 16, z: 28, rot: 0.5, w: 24, phase: 2.3 },
  { x: 36, z: -4, rot: 2.8, w: 16, phase: 5.2 },
  { x: -10, z: -24, rot: 1.1, w: 28, phase: 3.8 },
  { x: 2, z: 2, rot: 2.6, w: 40, phase: 1.2 },
];

/** The sun seen from below: a soft radial glow just under the surface that
 *  the shafts visually hang from. */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(210, 240, 255, 1)");
    g.addColorStop(0.25, "rgba(140, 210, 240, 0.55)");
    g.addColorStop(0.6, "rgba(60, 140, 210, 0.16)");
    g.addColorStop(1, "rgba(30, 90, 180, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export function UnderwaterVolume() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 26, 12, 8), []);
  const materials = useMemo(
    () =>
      SHAFTS.map(() =>
        createAuroraMaterial({ colorA: 0x1fd9c8, colorB: 0x2b6dff, wave: 0.4 }),
      ),
    [],
  );
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const glowMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    [glowTexture],
  );
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  useDisposable(geometry, ...materials, glowTexture, glowMaterial);
  useEffect(() => {
    meshRefs.current.length = SHAFTS.length;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const light = uniformProxies.acts.underwaterLight;
    for (let i = 0; i < SHAFTS.length; i++) {
      const def = SHAFTS[i];
      const material = materials[i];
      if (!def || !material) continue;
      const intensity = material.uniforms.uIntensity;
      // Swell modulation: each shaft brightens and dims on its own clock.
      const breathe = 0.55 + 0.45 * Math.sin(t * 0.13 + def.phase) * Math.sin(t * 0.07 + def.phase * 2.1);
      if (intensity) intensity.value = light * 0.85 * (0.45 + 0.55 * breathe);
      const mesh = meshRefs.current[i];
      if (mesh) mesh.rotation.x = 0.18 + Math.sin(t * 0.06 + def.phase) * 0.05;
    }
    glowMaterial.opacity = light * 0.5;
  });

  return (
    // Shifted ahead along the swim (+x): the cathedral stands where the
    // camera is HEADING during the dive, not where it entered.
    <group position={[OCEAN_CENTER[0] + 20, WATER_LEVEL - 13, OCEAN_CENTER[1] + 2]}>
      {SHAFTS.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          geometry={geometry}
          material={materials[i]}
          position={[s.x, 0, s.z]}
          rotation={[0.18, s.rot, 0]}
          scale={[s.w, 1, 1]}
        />
      ))}
      {/* The drowned sun the shafts converge toward. */}
      <sprite material={glowMaterial} position={[6, 11.5, 4]} scale={[55, 55, 1]} />
    </group>
  );
}
