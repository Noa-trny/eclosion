"use client";

import { motion } from "motion/react";
import { useScrollProgressMV } from "@/hooks/useScrollProgressMV";
import { useAppStore } from "@/stores/appStore";

/** Hairline progress across the top — the film's timecode. Driven by the
 *  shared MotionValue: zero React renders per frame. */
export function ProgressLine() {
  const progress = useScrollProgressMV();
  const started = useAppStore((s) => s.started);
  const mode = useAppStore((s) => s.mode);
  if (!started) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: progress }}
      className={`fixed left-0 right-0 top-0 z-30 h-[2px] origin-left bg-gradient-to-r from-white/15 via-white/40 to-[#ffb85c]/90 transition-opacity duration-700 ${
        mode === "scroll" ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
