"use client";

import { Suspense, lazy, useEffect, useState, type ComponentType, type LazyExoticComponent } from "react";
import { ACTS, isActInWindow } from "@/config/acts";
import { useProgressStore } from "@/stores/progressStore";
import { useAppStore } from "@/stores/appStore";

/** Acts are code-split: each scene chunk loads just before its progress
 *  window and unmounts (disposing GPU resources) once fully passed. */
const SCENES: Array<LazyExoticComponent<ComponentType>> = [
  lazy(() => import("@/components/3d/scenes/void/VoidScene").then((m) => ({ default: m.VoidScene }))),
  lazy(() => import("@/components/3d/scenes/seed/SeedScene").then((m) => ({ default: m.SeedScene }))),
  lazy(() => import("@/components/3d/scenes/forest/ForestScene").then((m) => ({ default: m.ForestScene }))),
  lazy(() => import("@/components/3d/scenes/storm/StormScene").then((m) => ({ default: m.StormScene }))),
  lazy(() => import("@/components/3d/scenes/ocean/OceanScene").then((m) => ({ default: m.OceanScene }))),
  lazy(() => import("@/components/3d/scenes/volcano/VolcanoScene").then((m) => ({ default: m.VolcanoScene }))),
  lazy(() => import("@/components/3d/scenes/bloom/BloomScene").then((m) => ({ default: m.BloomScene }))),
  lazy(() => import("@/components/3d/scenes/dawn/DawnScene").then((m) => ({ default: m.DawnScene }))),
];

function computeMounted(prev: readonly boolean[], progress: number): boolean[] {
  const mounted = ACTS.map((_, i) => isActInWindow(i, progress, prev[i] ?? false));
  // The seed's distant ember is visible from the void's first frame — keep
  // act 1 mounted whenever act 0 is (also covers the pre-start warm-up).
  if (mounted[0]) mounted[1] = true;
  if (!useAppStore.getState().started) {
    mounted[0] = true;
    mounted[1] = true;
  }
  return mounted;
}

export function SceneManager() {
  const [mounted, setMounted] = useState<boolean[]>(() =>
    computeMounted([], useProgressStore.getState().progress),
  );

  useEffect(() => {
    const update = (): void => {
      setMounted((prev) => {
        const next = computeMounted(prev, useProgressStore.getState().progress);
        // Same-reference bailout keeps this subscription render-free per tick.
        return next.every((v, i) => v === prev[i]) ? prev : next;
      });
    };
    update();
    const unsubProgress = useProgressStore.subscribe(update);
    const unsubApp = useAppStore.subscribe(update);
    return () => {
      unsubProgress();
      unsubApp();
    };
  }, []);

  return (
    <>
      {SCENES.map((Scene, i) => {
        const act = ACTS[i];
        if (!act || !mounted[i]) return null;
        return (
          <Suspense key={act.id} fallback={null}>
            <Scene />
          </Suspense>
        );
      })}
    </>
  );
}
