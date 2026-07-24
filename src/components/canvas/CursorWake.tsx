"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useProgressStore } from "@/stores/progressStore";
import { useAppStore } from "@/stores/appStore";
import { useDisposable } from "@/hooks/useDisposable";
import { recordSow } from "@/lib/sowStore";

const MAX = 160;
const LIFETIME = 1.6;

const vertexShader = /* glsl */ `
attribute float aAlpha;
attribute float aSize;
uniform float uDpr;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = min(aSize * uDpr * 300.0 / max(-mv.z, 1.0), 36.0 * uDpr);
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.1, d);
  float a = disc * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor * (0.8 + smoothstep(0.18, 0.0, d) * 1.4), a);
}
`;

const GOLD = new THREE.Color(1, 0.82, 0.4);
const CYAN = new THREE.Color(0.25, 0.9, 1);

/** The world answers the visitor: moving the pointer — or a finger dragging
 *  through the scroll — sows a wake of fireflies (forest) or plankton
 *  (ocean) that drifts and fades. Ring buffer of MAX CPU particles; emission
 *  gated by the act's own light intensity. Touch gets a denser, wider sow
 *  since the finger hides part of its own trail. */
export function CursorWake() {
  const coarse = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  );
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(MAX), 1));
    const sizes = new Float32Array(MAX);
    for (let i = 0; i < MAX; i++) sizes[i] = 0.25 + Math.random() * 0.4;
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
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
        uniforms: { uDpr: sharedUniforms.uDpr, uColor: { value: GOLD.clone() } },
      }),
    [],
  );
  useDisposable(geometry, material);

  const state = useRef({
    ages: new Float32Array(MAX).fill(LIFETIME),
    velocities: new Float32Array(MAX * 3),
    head: 0,
    lastPointer: new THREE.Vector2(2, 2),
    world: new THREE.Vector3(),
  }).current;

  useFrame(({ camera, pointer }, delta) => {
    const dt = Math.min(delta, 0.05);
    const { actIndex } = useProgressStore.getState();
    const inScroll = useAppStore.getState().mode === "scroll";
    const intensity = !inScroll
      ? 0
      : actIndex === 2
        ? uniformProxies.acts.fireflyIntensity
        : actIndex === 4
          ? uniformProxies.acts.planktonGlow
          : 0;
    material.uniforms.uColor?.value.copy(actIndex === 4 ? CYAN : GOLD);

    // Emit along pointer movement.
    const moved = state.lastPointer.distanceTo(pointer);
    if (intensity > 0.05 && moved > 0.004) {
      state.world.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      state.world.multiplyScalar(13).add(camera.position);
      // Every wake gesture is remembered — it will bloom golden in act VII.
      recordSow(pointer.x);
      const emit = Math.min(coarse ? 5 : 3, Math.ceil(moved * 40));
      const spread = coarse ? 0.9 : 0.5;
      const positions = geometry.attributes.position;
      for (let e = 0; e < emit && positions; e++) {
        const i = state.head;
        state.head = (state.head + 1) % MAX;
        positions.setXYZ(
          i,
          state.world.x + (Math.random() - 0.5) * spread,
          state.world.y + (Math.random() - 0.5) * spread,
          state.world.z + (Math.random() - 0.5) * spread,
        );
        state.velocities[i * 3] = (Math.random() - 0.5) * 0.8;
        state.velocities[i * 3 + 1] = 0.3 + Math.random() * 0.7;
        state.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        state.ages[i] = 0;
      }
    }
    state.lastPointer.copy(pointer);

    // Age, drift, fade.
    const positions = geometry.attributes.position;
    const alphas = geometry.attributes.aAlpha;
    if (!positions || !alphas) return;
    for (let i = 0; i < MAX; i++) {
      const age = state.ages[i] ?? LIFETIME;
      if (age >= LIFETIME) {
        alphas.setX(i, 0);
        continue;
      }
      state.ages[i] = age + dt;
      positions.setXYZ(
        i,
        positions.getX(i) + (state.velocities[i * 3] ?? 0) * dt,
        positions.getY(i) + (state.velocities[i * 3 + 1] ?? 0) * dt,
        positions.getZ(i) + (state.velocities[i * 3 + 2] ?? 0) * dt,
      );
      alphas.setX(i, (1 - age / LIFETIME) * 0.9);
    }
    positions.needsUpdate = true;
    alphas.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
