"use client";

import { motion, useTransform } from "motion/react";
import { useScrollProgressMV } from "@/hooks/useScrollProgressMV";
import { useAppStore } from "@/stores/appStore";
import { useT } from "@/hooks/useLang";

/** The scroll affordance — evaporates as soon as the journey begins. */
export function ScrollHint() {
  const progress = useScrollProgressMV();
  const opacity = useTransform(progress, [0, 0.02], [1, 0]);
  const started = useAppStore((s) => s.started);
  const t = useT();
  if (!started) return null;

  return (
    <motion.div
      style={{ opacity }}
      // Raised on phones so it never collides with the HUD buttons.
      className="pointer-events-none fixed bottom-24 left-1/2 z-30 -translate-x-1/2 text-center sm:bottom-8"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-2 h-9 w-5 rounded-full border border-white/30 pt-1.5"
      >
        <div className="mx-auto h-2 w-0.5 rounded bg-white/60" />
      </motion.div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">{t.scrollHint}</p>
    </motion.div>
  );
}
