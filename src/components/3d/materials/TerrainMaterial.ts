import * as THREE from "three";
import { terrainFragmentShader, terrainVertexShader } from "../shaders/terrain";
import { sharedUniforms } from "./sharedUniforms";

interface TerrainMaterialOptions {
  grass?: THREE.ColorRepresentation;
  rock?: THREE.ColorRepresentation;
  sand?: THREE.ColorRepresentation;
  craterPos?: [number, number, number];
}

/** Heightfield surface material — heights are baked on the CPU (same
 *  groundHeight the physics and free-roam use); the shader only shades. */
export function createTerrainMaterial(options: TerrainMaterialOptions = {}): THREE.ShaderMaterial {
  const crater = options.craterPos ?? [0, -9999, 0];
  return new THREE.ShaderMaterial({
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uSunDir: sharedUniforms.uSunDir,
      uSunColor: sharedUniforms.uSunColor,
      uSunIntensity: sharedUniforms.uSunIntensity,
      uAmbientColor: sharedUniforms.uAmbientColor,
      uAmbientIntensity: sharedUniforms.uAmbientIntensity,
      uFogColor: sharedUniforms.uFogColor,
      uFogDensity: sharedUniforms.uFogDensity,
      uGrassColor: { value: new THREE.Color(options.grass ?? 0x1c3a24) },
      uRockColor: { value: new THREE.Color(options.rock ?? 0x3a3f47) },
      uSandColor: { value: new THREE.Color(options.sand ?? 0x6b6250) },
      uCraterPos: { value: new THREE.Vector3(...crater) },
      uLavaGlow: { value: 0 },
    },
  });
}
