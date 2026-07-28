import { create } from "zustand";
import type * as THREE from "three";

interface LightSourceState {
  /** The session-long Celestial mesh (moon over the forest, sun at dawn).
   *  Registered once at boot; PostProcessing gates the pass by tier. */
  godRaySource: THREE.Mesh | null;
  setGodRaySource: (mesh: THREE.Mesh | null) => void;
}

export const useLightSourceStore = create<LightSourceState>((set) => ({
  godRaySource: null,
  setGodRaySource: (mesh) => set({ godRaySource: mesh }),
}));
