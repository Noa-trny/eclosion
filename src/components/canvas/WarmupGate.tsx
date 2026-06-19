"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useAppStore } from "@/stores/appStore";

/** Compiles every shader currently in the scene (acts 0-1 are force-mounted
 *  behind the StartScreen) BEFORE declaring the world ready — the first
 *  scroll never hitches on a compile. Hard 4s fallback so a driver stall can
 *  never trap the visitor on the start screen. */
export function WarmupGate() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let cancelled = false;
    const ready = (): void => {
      if (!cancelled && useAppStore.getState().phase === "boot") {
        useAppStore.getState().setPhase("ready");
      }
    };
    const fallback = setTimeout(ready, 4000);
    // Let the lazy act chunks resolve and mount first, then compile.
    const settle = setTimeout(() => {
      void gl
        .compileAsync(scene, camera)
        .catch(() => undefined)
        .then(() => {
          clearTimeout(fallback);
          ready();
        });
    }, 650);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clearTimeout(settle);
    };
  }, [gl, scene, camera]);

  return null;
}
