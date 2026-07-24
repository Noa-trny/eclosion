"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createLavaMaterial } from "@/components/3d/materials/LavaMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { CRATER_RADIUS, VOLCANO_CENTER } from "@/config/world";
import { groundHeight } from "@/utils/terrain";

/** A ribbon draped over the terrain, running downhill from the crater rim. */
function buildRibbon(direction: number, width: number, length: number): THREE.BufferGeometry {
  const [vx, vz] = VOLCANO_CENTER;
  const dx = Math.cos(direction);
  const dz = Math.sin(direction);
  const px = -dz;
  const pz = dx;
  const segments = 30;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const dist = CRATER_RADIUS * 0.8 + t * length;
    const cx = vx + dx * dist;
    const cz = vz + dz * dist;
    const w = width * (0.6 + t * 0.7);
    for (const side of [-1, 1]) {
      const x = cx + px * w * side * 0.5;
      const z = cz + pz * w * side * 0.5;
      positions.push(x - vx, groundHeight(x, z) + 0.28, z - vz);
      uvs.push(side * 0.5 + 0.5, t);
    }
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Crater lake + two ribbons of lava sharing one FBM-flow material. */
export function LavaFlow() {
  const material = useMemo(() => createLavaMaterial(), []);
  const craterGeometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(CRATER_RADIUS * 0.85, 40);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const ribbons = useMemo(
    () => [buildRibbon(0.7, 5, 60), buildRibbon(2.5, 3.5, 48), buildRibbon(4.3, 4.2, 68)],
    [],
  );
  useDisposable(material, craterGeometry, ...ribbons);
  const craterY = useMemo(() => groundHeight(VOLCANO_CENTER[0], VOLCANO_CENTER[1]) + 0.6, []);

  useFrame(() => {
    const flow = material.uniforms.uFlow;
    if (flow) flow.value = uniformProxies.acts.lavaFlow;
  });

  return (
    <group position={[VOLCANO_CENTER[0], 0, VOLCANO_CENTER[1]]}>
      <mesh geometry={craterGeometry} material={material} position={[0, craterY, 0]} />
      {ribbons.map((geo, i) => (
        <mesh key={i} geometry={geo} material={material} />
      ))}
      <pointLight
        position={[0, craterY + 8, 0]}
        color={0xff5a10}
        distance={120}
        decay={1.6}
        intensity={40}
      />
    </group>
  );
}
