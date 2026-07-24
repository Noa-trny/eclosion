"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ACTS } from "@/config/acts";
import { useProgressStore } from "@/stores/progressStore";
import { useAppStore } from "@/stores/appStore";
import { useHaikuStore } from "@/lib/haikus";
import { getAudioEngine } from "@/audio/engine";
import type { ActId } from "@/types/acts";

/** One discreet sigil per act — a slow-pulsing mote of light, hand-placed
 *  just off the camera's path. Nothing points at them; finding one is the
 *  point. */
const SIGILS: Record<ActId, [number, number, number]> = {
  void: [4.5, 4.2, 44],
  seed: [3.6, 2.7, 3.2],
  forest: [-11, 2.4, -24],
  storm: [17, 25, -65],
  ocean: [155, -11, 18],
  volcano: [260, 32.5, -38],
  bloom: [362, 8.7, 33],
  dawn: [421, 19.5, 60],
};

export function HaikuSigils() {
  const collected = useHaikuStore((s) => s.collected);
  const hydrate = useHaikuStore((s) => s.hydrate);
  const collect = useHaikuStore((s) => s.collect);
  const meshRefs = useRef<Map<ActId, THREE.Group>>(new Map());
  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.24, 1), []);
  const hitGeometry = useMemo(() => new THREE.SphereGeometry(1.5, 8, 6), []);
  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ visible: false }),
    [],
  );
  const coreMaterials = useMemo(
    () =>
      ACTS.map(
        () =>
          new THREE.MeshBasicMaterial({
            color: 0xffe9b8,
            transparent: true,
            opacity: 0,
            toneMapped: false,
          }),
      ),
    [],
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    return () => {
      coreGeometry.dispose();
      hitGeometry.dispose();
      hitMaterial.dispose();
      for (const m of coreMaterials) m.dispose();
    };
  }, [coreGeometry, hitGeometry, hitMaterial, coreMaterials]);

  useFrame(({ clock }) => {
    const progress = useProgressStore.getState().progress;
    const inScroll = useAppStore.getState().mode === "scroll";
    const t = clock.elapsedTime;
    for (let i = 0; i < ACTS.length; i++) {
      const act = ACTS[i];
      const material = coreMaterials[i];
      if (!act || !material) continue;
      const group = meshRefs.current.get(act.id);
      if (!group) continue;
      const inAct = progress >= act.range.start && progress <= act.range.end;
      const found = collected.includes(act.id);
      // Found sigils rest — a faint steady ember. Unfound ones breathe.
      const target = !inScroll || !inAct ? 0 : found ? 0.16 : 0.5 + Math.sin(t * 1.7 + i) * 0.28;
      material.opacity += (target - material.opacity) * 0.08;
      group.visible = material.opacity > 0.02;
      group.position.y = SIGILS[act.id][1] + Math.sin(t * 0.7 + i * 2.1) * 0.15;
      const s = 1 + Math.sin(t * 1.7 + i) * 0.12;
      group.scale.setScalar(s);
    }
  });

  return (
    <group>
      {ACTS.map((act, i) => (
        <group
          key={act.id}
          position={SIGILS[act.id]}
          visible={false}
          ref={(g) => {
            if (g) meshRefs.current.set(act.id, g);
          }}
        >
          <mesh geometry={coreGeometry} material={coreMaterials[i]} />
          {/* Generous invisible hit target — hunting, not pixel-sniping. */}
          <mesh
            geometry={hitGeometry}
            material={hitMaterial}
            onClick={(e) => {
              e.stopPropagation();
              if (useAppStore.getState().mode !== "scroll") return;
              const progress = useProgressStore.getState().progress;
              if (progress < act.range.start || progress > act.range.end) return;
              collect(act.id);
              getAudioEngine()?.haikuChime();
            }}
          />
        </group>
      ))}
    </group>
  );
}
