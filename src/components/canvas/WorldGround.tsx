"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { createTerrainGeometry } from "@/utils/geometry/terrainGeometry";
import { createTerrainMaterial } from "@/components/3d/materials/TerrainMaterial";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { VOLCANO_CENTER, WORLD_BOUNDS } from "@/config/world";
import { groundHeight } from "@/utils/terrain";

/** ONE ground mesh for the whole world (single draw call, no patch seams, no
 *  z-fighting) sampling the same analytic groundHeight as physics/free-roam. */
export function WorldGround() {
  const geometry = useMemo(() => {
    const width = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
    const depth = WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ;
    return createTerrainGeometry(
      (WORLD_BOUNDS.minX + WORLD_BOUNDS.maxX) / 2,
      (WORLD_BOUNDS.minZ + WORLD_BOUNDS.maxZ) / 2,
      width,
      Math.floor(width / 2.2),
      depth,
      Math.floor(depth / 2.2),
    );
  }, []);
  const material = useMemo(
    () =>
      createTerrainMaterial({
        craterPos: [VOLCANO_CENTER[0], groundHeight(VOLCANO_CENTER[0], VOLCANO_CENTER[1]), VOLCANO_CENTER[1]],
      }),
    [],
  );
  useDisposable(geometry, material);

  useFrame(() => {
    const glow = material.uniforms.uLavaGlow;
    if (glow) glow.value = uniformProxies.acts.lavaFlow;
  });

  const centerX = (WORLD_BOUNDS.minX + WORLD_BOUNDS.maxX) / 2;
  const centerZ = (WORLD_BOUNDS.minZ + WORLD_BOUNDS.maxZ) / 2;
  return <mesh geometry={geometry} material={material} position={[centerX, 0, centerZ]} />;
}
