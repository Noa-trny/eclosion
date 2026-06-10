"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Flock } from "@/lib/boids/Flock";
import { createBirdGeometry } from "@/utils/geometry/birdGeometry";
import { createCreatureMaterial } from "@/components/3d/materials/CreatureMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { QUALITY_PRESETS } from "@/config/quality";
import { MEADOW_CENTER } from "@/config/world";
import { mulberry32 } from "@/utils/random";

const X_AXIS = new THREE.Vector3(1, 0, 0);

/** Birds writing the wind over the meadow — same boids core as the fish. */
export function BirdFlock() {
  const tier = useQualityStore((s) => s.tier);
  const count = Math.round(140 * QUALITY_PRESETS[tier].boidScale);
  const flock = useMemo(
    () =>
      new Flock({
        count,
        center: [MEADOW_CENTER[0], 30, MEADOW_CENTER[1]],
        size: [120, 26, 120],
        speed: 9,
        maxForce: 16,
        perception: 6,
        separationWeight: 1.1,
        alignmentWeight: 0.9,
        cohesionWeight: 0.5,
        boundsWeight: 7,
        seed: 29,
      }),
    [count],
  );
  const geometry = useMemo(() => {
    const geo = createBirdGeometry();
    const rng = mulberry32(17);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) phases[i] = rng() * Math.PI * 2;
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    return geo;
  }, [count]);
  const material = useMemo(() => createCreatureMaterial("bird", 0x2b2530), []);
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
    const activity = uniformProxies.acts.birdActivity;
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

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />;
}
