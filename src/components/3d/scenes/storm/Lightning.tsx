"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { getAudioEngine } from "@/audio/engine";
import { groundHeight } from "@/utils/terrain";
import { useDisposable } from "@/hooks/useDisposable";

const MAX_SEGMENTS = 26;
const BOLT_WIDTH = 0.32;

/** Builds a jagged channel from the cloud base to the ground, with one side
 *  branch — regenerated for every strike as camera-safe RIBBON quads (a 1px
 *  line would vanish under DOF; a 0.4-unit ribbon blooms properly). */
function buildBolt(positions: Float32Array, x: number, z: number): number {
  let idx = 0;
  const push = (ax: number, ay: number, az: number, bx: number, by: number, bz: number): void => {
    if (idx >= MAX_SEGMENTS) return;
    // Perpendicular roughly horizontal to the segment direction.
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    let px = -dz;
    let py = 0;
    let pz = dx;
    const len = Math.hypot(px, pz) || 1;
    px = (px / len) * BOLT_WIDTH;
    pz = (pz / len) * BOLT_WIDTH;
    if (Math.abs(dy) < 0.5) {
      py = BOLT_WIDTH;
      px = 0;
      pz = 0;
    }
    const base = idx * 18;
    positions.set(
      [
        ax - px, ay - py, az - pz, bx - px, by - py, bz - pz, bx + px, by + py, bz + pz,
        ax - px, ay - py, az - pz, bx + px, by + py, bz + pz, ax + px, ay + py, az + pz,
      ],
      base,
    );
    idx++;
  };
  const top = 46;
  const ground = groundHeight(x, z);
  const steps = 11;
  let px = x;
  let pz = z;
  let py = top;
  const branchAt = 3 + Math.floor(Math.random() * 4);
  for (let i = 1; i <= steps; i++) {
    const ny = top - (i / steps) * (top - ground);
    const nx = px + (Math.random() - 0.5) * 7;
    const nz = pz + (Math.random() - 0.5) * 7;
    push(px, py, pz, nx, ny, nz);
    if (i === branchAt) {
      // A dead-end fork, thinner reach to the side.
      let bx = nx;
      let by = ny;
      let bz = nz;
      for (let b = 0; b < 4; b++) {
        const cx = bx + (Math.random() - 0.5) * 9 + 3;
        const cy = by - 3 - Math.random() * 4;
        const cz = bz + (Math.random() - 0.5) * 9;
        push(bx, by, bz, cx, cy, cz);
        bx = cx;
        by = cy;
        bz = cz;
      }
    }
    px = nx;
    py = ny;
    pz = nz;
  }
  return idx;
}

/** Randomized strikes: a sky-wide flash (uFlash, read by the sky/cloud
 *  shaders), a decaying point light, a VISIBLE jagged bolt, and a
 *  distance-delayed thunder clap. */
const BOLT_SLOTS = 3;

export function Lightning() {
  const lightRef = useRef<THREE.PointLight>(null);
  const countdown = useRef(2.5);
  const restrike = useRef(0);
  const restrikeSlot = useRef(0);
  const slot = useRef(0);
  const wasActive = useRef(false);
  const wasFull = useRef(false);
  const forward = useRef(new THREE.Vector3()).current;

  // Several bolts can be alive at once — a storm rarely strikes politely
  // one channel at a time.
  const boltGeometries = useMemo(
    () =>
      Array.from({ length: BOLT_SLOTS }, () => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_SEGMENTS * 18), 3));
        geo.setDrawRange(0, 0);
        return geo;
      }),
    [],
  );
  const boltMaterials = useMemo(
    () =>
      Array.from(
        { length: BOLT_SLOTS },
        () =>
          new THREE.MeshBasicMaterial({
            color: 0xeaf1ff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
            // Lightning PIERCES the fog — scene.fog would wash it to grey.
            fog: false,
          }),
      ),
    [],
  );
  useDisposable(...boltGeometries, ...boltMaterials);

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return;
    const dt = Math.min(delta, 0.05);
    light.intensity *= Math.exp(-8 * dt);
    // A strike lingers ~0.3s and flickers — real lightning is not one frame.
    for (const material of boltMaterials) material.opacity *= Math.exp(-4.5 * dt);
    // The double-strike flicker that makes lightning feel real.
    if (restrike.current > 0) {
      restrike.current -= dt;
      if (restrike.current <= 0) {
        sharedUniforms.uFlash.value = 0.5 + Math.random() * 0.4;
        light.intensity = 800;
        const material = boltMaterials[restrikeSlot.current];
        if (material) material.opacity = 0.85;
      }
    }
    const activity = uniformProxies.acts.lightningActivity;
    if (activity < 0.05) {
      wasActive.current = false;
      return;
    }
    // First strike lands FAST on entry — a forward scroller crosses the act
    // in seconds and must not leave before the sky answers.
    if (!wasActive.current) {
      wasActive.current = true;
      countdown.current = 0.35;
    }
    // Entering FULL storm cancels any long lull rolled during the distant
    // foreshadow — visitors give this act ~4 seconds, strike NOW.
    if (activity > 0.6 && !wasFull.current) {
      wasFull.current = true;
      countdown.current = Math.min(countdown.current, 0.3);
    } else if (activity <= 0.6 && wasFull.current) {
      wasFull.current = false;
    }
    countdown.current -= dt;
    if (countdown.current > 0) return;
    countdown.current = 0.4 + (Math.random() * 1.6) / activity;
    // Strike INSIDE the camera's forward cone, wherever the rig is looking —
    // the camera travels the whole act, a fixed zone kept missing the frame.
    state.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    // Low activity = the distant foreshadow over the canopy; full activity =
    // strikes close enough to feel.
    const distance = activity < 0.4 ? 90 + Math.random() * 60 : 32 + Math.random() * 48;
    const lateral = (Math.random() - 0.5) * distance * 0.9;
    const x = state.camera.position.x + forward.x * distance - forward.z * lateral;
    const z = state.camera.position.z + forward.z * distance + forward.x * lateral;
    sharedUniforms.uFlash.value = 0.85 + Math.random() * 0.35;
    light.position.set(x, 38 + Math.random() * 18, z);
    light.intensity = 1400;
    slot.current = (slot.current + 1) % BOLT_SLOTS;
    const geometry = boltGeometries[slot.current];
    const material = boltMaterials[slot.current];
    const positions = geometry?.attributes.position;
    if (geometry && positions) {
      const segments = buildBolt(positions.array as Float32Array, x, z);
      positions.needsUpdate = true;
      geometry.setDrawRange(0, segments * 6);
    }
    if (material) material.opacity = 1;
    if (Math.random() < 0.35) {
      restrike.current = 0.12;
      restrikeSlot.current = slot.current;
    }
    getAudioEngine()?.thunder();
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __boltDebug?: object }).__boltDebug = {
        x,
        z,
        slot: slot.current,
        strikes: ((window as unknown as { __boltDebug?: { strikes?: number } }).__boltDebug?.strikes ?? 0) + 1,
      };
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} color={0xbfd0ff} distance={280} decay={1.6} intensity={0} />
      {boltGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={boltMaterials[i]} frustumCulled={false} />
      ))}
    </group>
  );
}
