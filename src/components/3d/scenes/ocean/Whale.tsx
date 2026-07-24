"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createWhaleGeometry } from "@/utils/geometry/whaleGeometry";
import { createCreatureMaterial } from "@/components/3d/materials/CreatureMaterial";
import { useThree } from "@react-three/fiber";
import { useProgressStore } from "@/stores/progressStore";
import { getAudioEngine } from "@/audio/engine";
import { remap } from "@/utils/math";

const START = new THREE.Vector3(208, -18, 58);
const END = new THREE.Vector3(112, -15, -48);
/** Portrait frames are NARROW: at the landscape crossing scale the whale
 *  overflows the screen — scale her down there so the whole silhouette fits.
 *  (A path offset was tried first: it helps mid-crossing but brings her
 *  CLOSER at the window's edges. Scale is monotonic.) */
const PORTRAIT_SCALE = 1.35;
const WINDOW: [number, number] = [0.535, 0.605];
const X_AXIS = new THREE.Vector3(1, 0, 0);

/** One slow pass of a massive silhouette in the far blue — and only one.
 *  Once its crossing completes, it never returns this session. */
export function Whale() {
  const geometry = useMemo(() => {
    const geo = createWhaleGeometry();
    // CreatureMaterial expects the instanced aPhase attribute (count = 1).
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(new Float32Array([2.1]), 1));
    return geo;
  }, []);
  const material = useMemo(() => createCreatureMaterial("fish", 0x061622), []);
  const mesh = useMemo(() => {
    const instanced = new THREE.InstancedMesh(geometry, material, 1);
    instanced.frustumCulled = false;
    instanced.visible = false;
    return instanced;
  }, [geometry, material]);
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      mesh.dispose();
    };
  }, [geometry, material, mesh]);

  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.9;
  const done = useRef(false);
  const called = useRef(false);
  const dummy = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      dir: new THREE.Vector3().subVectors(END, START).normalize(),
      quat: new THREE.Quaternion().setFromUnitVectors(X_AXIS, new THREE.Vector3().subVectors(END, START).normalize()),
      scale: new THREE.Vector3(1.7, 1.7, 1.7),
      m: new THREE.Matrix4(),
    }),
    [],
  );

  useFrame(() => {
    const p = useProgressStore.getState().progress;
    const inWindow = p >= WINDOW[0] && p <= WINDOW[1];
    // One pass per APPROACH: scrolling back before the window re-arms her,
    // so revisiting the deep always grants another crossing.
    if (p < WINDOW[0] - 0.02) {
      done.current = false;
      called.current = false;
    }
    if (done.current || !inWindow) {
      mesh.visible = false;
      return;
    }
    const t = remap(p, WINDOW[0], WINDOW[1], 0, 1);
    if (t > 0.985) done.current = true;
    mesh.visible = true;
    dummy.pos.lerpVectors(START, END, t);
    dummy.scale.setScalar(portrait ? PORTRAIT_SCALE : 1.7);
    // She calls at mid-crossing — her closest point to the camera, so the
    // HRTF distance falloff carries instead of burying her.
    if (!called.current && t > 0.3 && getAudioEngine()) {
      called.current = true;
      getAudioEngine()?.whaleCall(dummy.pos.x, dummy.pos.y, dummy.pos.z);
    }
    dummy.pos.y += Math.sin(t * Math.PI * 2) * 1.6;
    dummy.m.compose(dummy.pos, dummy.quat, dummy.scale);
    mesh.setMatrixAt(0, dummy.m);
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={mesh} />;
}
