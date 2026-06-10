"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { stepProp, wakeProp, type PhysicsProp } from "@/lib/physics/integrator";
import { resolveGround } from "@/lib/physics/colliders";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { MEADOW_CENTER } from "@/config/world";
import { mulberry32 } from "@/utils/random";

const COUNT = 26;

/** Seed pods drifting down and bouncing on the meadow — the light physics
 *  layer (semi-implicit Euler vs the analytic heightfield). */
export function SeedPods() {
  const props = useMemo<PhysicsProp[]>(() => {
    const rng = mulberry32(808);
    return Array.from({ length: COUNT }, () => ({
      px: MEADOW_CENTER[0] + (rng() - 0.5) * 70,
      py: 14 + rng() * 18,
      pz: MEADOW_CENTER[1] + (rng() - 0.5) * 70,
      vx: (rng() - 0.5) * 2,
      vy: 0,
      vz: (rng() - 0.5) * 2,
      radius: 0.22,
      restitution: 0.5,
      sleeping: false,
    }));
  }, []);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.22, 0), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xd9c48a, roughness: 0.8 }),
    [],
  );
  useDisposable(geometry, material);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.05);
    let allAsleep = true;
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (!prop) continue;
      stepProp(prop, dt, uniformProxies.wind, resolveGround);
      if (!prop.sleeping) allAsleep = false;
      m.makeTranslation(prop.px, prop.py, prop.pz);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // A gust occasionally sends a sleeping pod tumbling again.
    if (allAsleep && Math.random() < dt * 0.35) {
      const prop = props[Math.floor(Math.random() * props.length)];
      if (prop) wakeProp(prop, [(Math.random() - 0.5) * 4, 3 + Math.random() * 3, (Math.random() - 0.5) * 4]);
    }
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} frustumCulled={false} />;
}
