import { create } from "zustand";
import type { AppMode, AppPhase } from "@/types/mode";

interface AppState {
  phase: AppPhase;
  mode: AppMode;
  /** True once the visitor clicked through the start screen. */
  started: boolean;
  audioOn: boolean;
  editorOpen: boolean;
  contextLost: boolean;
  /** Bumped on webglcontextrestored so the composer rebuilds. */
  restoreNonce: number;
  reducedMotion: boolean;
  /** Bumped by the HUD/keyboard; the FreeRoamController (which owns the
   *  camera) watches it and performs the actual transition. */
  modeToggleNonce: number;
  /** Bumped after each photo capture — drives the shutter flash + toast. */
  photoNonce: number;
  /** The post-credits secret: armed by stillness at the very end. */
  secretActive: boolean;
  setPhase: (phase: AppPhase) => void;
  setMode: (mode: AppMode) => void;
  start: (withAudio: boolean) => void;
  toggleAudio: () => void;
  toggleEditor: () => void;
  requestModeToggle: () => void;
  photoTaken: () => void;
  setSecret: (on: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  phase: "boot",
  mode: "scroll",
  started: false,
  audioOn: false,
  editorOpen: false,
  contextLost: false,
  restoreNonce: 0,
  reducedMotion: false,
  modeToggleNonce: 0,
  photoNonce: 0,
  secretActive: false,
  setPhase: (phase) => set({ phase }),
  setMode: (mode) => set({ mode }),
  start: (withAudio) => set({ started: true, audioOn: withAudio, phase: "running" }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  toggleEditor: () => set((s) => ({ editorOpen: !s.editorOpen })),
  requestModeToggle: () => set((s) => ({ modeToggleNonce: s.modeToggleNonce + 1 })),
  photoTaken: () => set((s) => ({ photoNonce: s.photoNonce + 1 })),
  setSecret: (on) => set({ secretActive: on }),
}));
