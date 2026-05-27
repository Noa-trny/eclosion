"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import { useProgressStore } from "@/stores/progressStore";

/** Bridges the transient progress store into ONE MotionValue — Framer Motion
 *  then updates DOM styles outside React, so text sync costs zero renders. */
export function useScrollProgressMV(): MotionValue<number> {
  const mv = useMotionValue(useProgressStore.getState().progress);
  useEffect(
    () => useProgressStore.subscribe((state) => mv.set(state.progress)),
    [mv],
  );
  return mv;
}
