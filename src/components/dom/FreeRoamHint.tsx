"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/stores/appStore";

/** Controls card shown while exploring. */
export function FreeRoamHint() {
  const mode = useAppStore((s) => s.mode);
  return (
    <AnimatePresence>
      {mode === "free" && (
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed left-1/2 top-5 z-30 -translate-x-1/2 rounded-xl border border-white/15 bg-black/40 px-5 py-3 text-center backdrop-blur"
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
            Exploration libre
          </p>
          <p className="mt-1 text-[11px] text-white/45">
            ZQSD / WASD se déplacer · souris regarder · Maj sprint · Espace monter · C descendre · F
            reprendre le récit
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
