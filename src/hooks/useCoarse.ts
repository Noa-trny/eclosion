"use client";

import { useEffect, useState } from "react";

/** True on touch-first devices — used to swap keyboard-flavored UI for
 *  touch-flavored UI. Starts false to MATCH the server render (hydration
 *  safety), flips right after mount; the start screen covers the swap. */
export function useCoarse(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return coarse;
}

/** Strips the keyboard shortcut suffix ("Explorer (F)" → "Explorer"). */
export function stripKey(label: string): string {
  return label.replace(/\s*\([A-Z]\)\s*$/, "");
}
