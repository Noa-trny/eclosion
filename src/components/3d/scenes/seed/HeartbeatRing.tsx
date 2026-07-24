"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uGlow;
varying vec2 vUv;

float ring(float r, float t) {
  float radius = t * 6.5;
  float w = 0.35 + t * 0.5;
  float band = exp(-pow((r - radius) / w, 2.0));
  return band * exp(-t * 2.6);
}

void main() {
  float r = length(vUv - 0.5) * 16.0;
  float tt = mod(uTime, 1.5);
  // Two waves per heartbeat — the thump and its echo.
  float a = ring(r, max(tt - 0.18, 0.0)) + 0.55 * ring(r, max(tt - 0.51, 0.0));
  a *= uGlow * 0.28 * smoothstep(8.0, 5.0, r);
  gl_FragColor = vec4(vec3(1.0, 0.72, 0.4) * a, a);
}
`;

/** The first heartbeat made VISIBLE: a soft shockwave of warm light rolling
 *  over the soil from the mound, twice per beat, in the seed's rhythm. */
export function HeartbeatRing() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 16);
    geo.rotateX(-Math.PI / 2);
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
        uniforms: { uTime: { value: 0 }, uGlow: { value: 0 } },
      }),
    [],
  );
  useDisposable(geometry, material);

  useFrame(({ clock }) => {
    const u = material.uniforms;
    if (u.uTime) u.uTime.value = clock.elapsedTime;
    if (u.uGlow) u.uGlow.value = uniformProxies.acts.seedGlow;
  });

  return <mesh geometry={geometry} material={material} position={[0, 0.12, 0]} />;
}
