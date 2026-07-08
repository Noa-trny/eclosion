"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";
import { VOLCANO_CENTER } from "@/config/world";
import { groundHeight } from "@/utils/terrain";

const vertexShader = /* glsl */ `
attribute vec2 aCorner;
uniform float uSize;
varying vec2 vUv;
void main() {
  vec4 worldCenter = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 pos = worldCenter.xyz + (right * aCorner.x + up * aCorner.y) * uSize;
  vUv = aCorner * 0.5 + 0.5;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5);
  float pulse = 0.85 + 0.15 * sin(uTime * 2.1) * sin(uTime * 3.7);
  // Steep falloff — a halo hugging the crater, never a screen wash.
  float a = pow(smoothstep(0.5, 0.0, d), 3.2) * uIntensity * pulse;
  if (a < 0.004) discard;
  vec3 col = mix(vec3(1.0, 0.5, 0.12), vec3(1.0, 0.22, 0.04), d * 2.0);
  gl_FragColor = vec4(col, a * 0.5);
}
`;

/** The eruption's glow ceiling: a billboard halo over the crater that lights
 *  the smoke column from below — the signature of every real eruption shot. */
export function CraterGlow() {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    geo.setAttribute(
      "aCorner",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2),
    );
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    return geo;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: sharedUniforms.uTime, uIntensity: { value: 0 }, uSize: { value: 15 } },
      }),
    [],
  );
  useDisposable(geometry, material);
  const y = useMemo(() => groundHeight(VOLCANO_CENTER[0], VOLCANO_CENTER[1]) + 9, []);

  useFrame(() => {
    const intensity = material.uniforms.uIntensity;
    if (intensity) intensity.value = uniformProxies.acts.lavaFlow * 0.45;
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[VOLCANO_CENTER[0], y, VOLCANO_CENTER[1]]}
      frustumCulled={false}
    />
  );
}
