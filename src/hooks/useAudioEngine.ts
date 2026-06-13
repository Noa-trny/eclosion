"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { getAudioEngine, initAudioEngine } from "@/audio/engine";

/** DOM-side audio lifecycle: mute toggles + tab visibility. The engine itself
 *  is created inside the StartScreen click (autoplay policy); the M-key path
 *  also runs inside a keydown, which counts as user activation. */
export function useAudioBridge(): void {
  useEffect(() => {
    return useAppStore.subscribe((state, prev) => {
      if (state.audioOn === prev.audioOn || !state.started) return;
      if (state.audioOn) {
        initAudioEngine().setMuted(false);
      } else {
        getAudioEngine()?.setMuted(true);
      }
    });
  }, []);

  useEffect(() => {
    const onVisibility = (): void => {
      const engine = getAudioEngine();
      if (!engine) return;
      if (document.hidden) engine.suspend();
      else if (useAppStore.getState().audioOn) engine.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
}
