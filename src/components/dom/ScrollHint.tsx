"use client";

import { motion, useTransform } from "motion/react";
import { useScrollProgressMV } from "@/hooks/useScrollProgressMV";
import { useAppStore } from "@/stores/appStore";
import { useT } from "@/hooks/useLang";
import { useCoarse } from "@/hooks/useCoarse";

/** The scroll affordance — evaporates as soon as the journey begins. */
export function ScrollHint() {
  const progress = useScrollProgressMV();
  const opacity = useTransform(progress, [0, 0.02], [1, 0]);
  const started = useAppStore((s) => s.started);
  const t = useT();
  const coarse = useCoarse();
  if (!started) return null;

  return (
    <motion.div
      style={{ opacity }}
      // Raised on phones so it never collides with the HUD buttons.
      className="pointer-events-none fixed bottom-24 left-1/2 z-30 -translate-x-1/2 text-center sm:bottom-8"
    >
      {coarse ? (
        /* Touch: a swipe-up cue, not a mouse — the thumb's gesture. */
        <div className="mx-auto mb-2 flex h-9 items-end justify-center">
          <motion.div
            animate={{ y: [8, -14], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            className="h-2 w-2 rounded-full bg-white/70"
          />
        </div>
      ) : (
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-2 h-9 w-5 rounded-full border border-white/30 pt-1.5"
        >
          <div className="mx-auto h-2 w-0.5 rounded bg-white/60" />
        </motion.div>
      )}
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">{t.scrollHint}</p>
    </motion.div>
  );
}
