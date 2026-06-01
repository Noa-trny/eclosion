"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ParticlePreset } from "@/types/particles";
import { buildParticleVertexShader } from "@/components/3d/shaders/particles/base";
import { behaviorChunk } from "@/components/3d/shaders/particles/behaviors";
import { particleFragmentShader } from "@/components/3d/shaders/particles/frag";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { mulberry32 } from "@/utils/random";
import { particleCount, useQualityStore } from "@/stores/qualityStore";
import { useDisposable } from "@/hooks/useDisposable";

interface GPUParticlesProps {
  preset: ParticlePreset;
  /** Read every frame (usually from uniformProxies) — 0 fades the system out. */
  getIntensity?: () => number;
  position?: [number, number, number];
  seed?: number;
}

/** The one particle base all systems derive from. Buffers are allocated at the
 *  high-tier count once; quality changes only move setDrawRange. Simulation is
 *  stateless in the vertex shader (see shaders/particles). */
export function GPUParticles({ preset, getIntensity, position, seed = 1 }: GPUParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const max = preset.counts.high;
    const rng = mulberry32(seed * 7919 + preset.id.length * 131);
    const positions = new Float32Array(max * 3);
    const seeds = new Float32Array(max * 4);
    const [sx, sy, sz] = preset.spawn.size;
    for (let i = 0; i < max; i++) {
      if (preset.spawn.kind === "sphere") {
        // Uniform in a ball, biased outward so star fields read as a dome.
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(2 * rng() - 1);
        const r = (sx / 2) * (0.35 + 0.65 * Math.cbrt(rng()));
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi);
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      } else {
        positions[i * 3] = (rng() - 0.5) * sx;
        positions[i * 3 + 1] = (rng() - 0.5) * sy;
        positions[i * 3 + 2] = (rng() - 0.5) * sz;
      }
      seeds[i * 4] = rng();
      seeds[i * 4 + 1] = rng();
      seeds[i * 4 + 2] = rng();
      seeds[i * 4 + 3] = rng();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    return geo;
  }, [preset, seed]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: buildParticleVertexShader(behaviorChunk(preset.behavior)),
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: preset.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uWind: sharedUniforms.uWind,
        uDpr: sharedUniforms.uDpr,
        uIntensity: { value: 1 },
        uSize: { value: preset.size },
        uSpeed: { value: preset.speed },
        uNoiseScale: { value: preset.noiseScale },
        uWindInfluence: { value: preset.windInfluence },
        uSpawnSize: { value: new THREE.Vector3(...preset.spawn.size) },
        uOpacity: { value: preset.opacity },
        uColorA: { value: new THREE.Vector3(...preset.colorA) },
        uColorB: { value: new THREE.Vector3(...preset.colorB) },
      },
    });
  }, [preset]);

  useDisposable(geometry, material);

  useEffect(() => {
    const apply = (): void => {
      geometry.setDrawRange(0, Math.min(preset.counts.high, particleCount(preset.counts.high)));
    };
    apply();
    return useQualityStore.subscribe(apply);
  }, [geometry, preset]);

  useFrame(() => {
    const u = material.uniforms.uIntensity;
    if (u) u.value = getIntensity ? getIntensity() : 1;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={position}
      frustumCulled={false}
    />
  );
}
