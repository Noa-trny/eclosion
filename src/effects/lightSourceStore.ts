import { create } from "zustand";
import type * as THREE from "three";

interface LightSourceState {
  /** The moon (forest) or sun (dawn) mesh currently able to cast god rays.
   *  Scenes register on mount; PostProcessing conditionally adds the pass. */
  godRaySource: THREE.Mesh | null;
  setGodRaySource: (mesh: THREE.Mesh | null) => void;
}

export const useLightSourceStore = create<LightSourceState>((set) => ({
  godRaySource: null,
  setGodRaySource: (mesh) => set({ godRaySource: mesh }),
}));
