"use client";

import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
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

/** Mounts an act's subtree invisible and reveals it only once its shaders
 *  have genuinely LINKED — and been introspected. Mounting ahead of the
 *  window (MOUNT_PAD) is not enough on its own: nothing draws until the
 *  camera sweeps over the act, and the first draw of an unready program
 *  blocks on getProgramParameter — profiled at ~600ms in one frame,
 *  mid-scroll, at the forest boundary (and worse for the storm). Three
 *  stalls hide in that frame, each handled here:
 *
 *  1. the link wait — compileAsync rides KHR_parallel_shader_compile and
 *     resolves off the main thread;
 *  2. the cache-key trap — the composer's RenderPass draws the scene under
 *     its own renderer state, so a compile under the DEFAULT state builds
 *     programs the real draw never uses, and the first draw links again
 *     from scratch (this bit every warm-up path in the app);
 *  3. the introspection — even a linked program pays ANGLE's deferred
 *     reflection on its first ACTIVE_UNIFORMS query (~180ms each here), so
 *     getUniforms() is forced program by program, one per frame, while the
 *     act is still hidden.
 *
 *  Acts already mounted during boot skip the gate: WarmupGate compiles those
 *  behind the loading ring, and the start screen must never wait on a hidden
 *  void. A hard fallback reveals regardless — a stalled driver must never
 *  keep an act out of the world. */
function WarmMount({ children }: { children: ReactNode }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const [warm, setWarm] = useState(() => !useAppStore.getState().started);

  useEffect(() => {
    if (warm) return;
    let cancelled = false;
    let raf = 0;
    const reveal = (): void => {
      if (!cancelled) setWarm(true);
    };
    const fallback = setTimeout(reveal, 4000);
    // One tick so children that add meshes in their own effects are in the
    // graph before the compile walk.
    const start = setTimeout(() => {
      const prevToneMapping = gl.toneMapping;
      const prevColorSpace = gl.outputColorSpace;
      gl.toneMapping = THREE.NoToneMapping;
      gl.outputColorSpace = THREE.LinearSRGBColorSpace;
      const compiled = gl.compileAsync(scene, camera).catch(() => undefined);
      gl.toneMapping = prevToneMapping;
      gl.outputColorSpace = prevColorSpace;
      void compiled.then(() => {
        if (cancelled) return;
        // Force the uniform reflection now, spread one program per frame.
        // renderer.properties is internal — every step is guarded, and the
        // worst a three upgrade can do is put the stall back at first draw.
        const programs: Array<{ getUniforms: () => unknown }> = [];
        try {
          const properties = (
            gl as unknown as {
              properties?: { get: (m: THREE.Material) => { currentProgram?: { getUniforms: () => unknown } } };
            }
          ).properties;
          if (properties) {
            scene.traverse((object) => {
              const material = (object as THREE.Mesh).material;
              for (const m of Array.isArray(material) ? material : [material]) {
                if (!m) continue;
                const program = properties.get(m)?.currentProgram;
                if (program && !programs.includes(program)) programs.push(program);
              }
            });
          }
        } catch {
          // Internals moved — reveal with programs linked but unreflected.
        }
        const step = (): void => {
          if (cancelled) return;
          const program = programs.pop();
          if (!program) {
            clearTimeout(fallback);
            reveal();
            return;
          }
          try {
            program.getUniforms();
          } catch {
            programs.length = 0;
          }
          raf = requestAnimationFrame(step);
        };
        step();
      });
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [warm, gl, scene, camera]);

  return <group visible={warm}>{children}</group>;
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
            {/* Inside the boundary: the gate only starts once the lazy chunk
                has resolved and the scene's materials are in the graph. */}
            <WarmMount>
              <Scene />
            </WarmMount>
          </Suspense>
        );
      })}
    </>
  );
}
