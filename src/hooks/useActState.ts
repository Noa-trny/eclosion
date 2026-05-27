"use client";

import { useProgressStore } from "@/stores/progressStore";

/** The ONLY per-scroll React subscription in the app: a primitive selector
 *  that changes at most 8 times over the whole journey. Per-frame values must
 *  be read with useProgressStore.getState() inside useFrame instead. */
export function useActIndex(): number {
  return useProgressStore((s) => s.actIndex);
}
