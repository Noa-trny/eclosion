"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Flock } from "@/lib/boids/Flock";
import { createFishGeometry } from "@/utils/geometry/fishGeometry";
import { createCreatureMaterial } from "@/components/3d/materials/CreatureMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { QUALITY_PRESETS } from "@/config/quality";
import { OCEAN_CENTER, WATER_LEVEL } from "@/config/world";
import { mulberry32 } from "@/utils/random";

const X_AXIS = new THREE.Vector3(1, 0, 0);

/** Boids school rendered as an InstancedMesh; orientation from velocity. */
export function FishFlock() {
  const tier = useQualityStore((s) => s.tier);
  const count = Math.round(240 * QUALITY_PRESETS[tier].boidScale);
  const flock = useMemo(
    () =>
      new Flock({
        count,
        center: [OCEAN_CENTER[0], WATER_LEVEL - 10, OCEAN_CENTER[1]],
        size: [90, 15, 90],
        speed: 6,
        maxForce: 20,
        perception: 4,
        separationWeight: 1.3,
        alignmentWeight: 0.7,
        cohesionWeight: 0.45,
        boundsWeight: 8,
        seed: 71,
      }),
    [count],
  );
  const geometry = useMemo(() => {
    const geo = createFishGeometry();
    const rng = mulberry32(5);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) phases[i] = rng() * Math.PI * 2;
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    return geo;
  }, [count]);
  const material = useMemo(() => createCreatureMaterial("fish", 0x2c5570, 0x14e0c0), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(
    () => ({ pos: new THREE.Vector3(), dir: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1), m: new THREE.Matrix4() }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const activity = uniformProxies.acts.fishActivity;
    mesh.visible = activity > 0.02;
    if (!mesh.visible) return;
    flock.step(Math.min(delta, 0.05) * Math.min(activity + 0.2, 1));
    const { positions, velocities } = flock;
    for (let i = 0; i < flock.count; i++) {
      dummy.pos.set(positions[i * 3] ?? 0, positions[i * 3 + 1] ?? 0, positions[i * 3 + 2] ?? 0);
      dummy.dir.set(velocities[i * 3] ?? 1, velocities[i * 3 + 1] ?? 0, velocities[i * 3 + 2] ?? 0).normalize();
      dummy.quat.setFromUnitVectors(X_AXIS, dummy.dir);
      dummy.m.compose(dummy.pos, dummy.quat, dummy.scale);
      mesh.setMatrixAt(i, dummy.m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
