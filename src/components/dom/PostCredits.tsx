"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { useProgressStore } from "@/stores/progressStore";
import { scrollToProgress } from "@/lib/scrollControl";
import { getAudioEngine } from "@/audio/engine";
import { useT } from "@/hooks/useLang";

/** How long the visitor must stay still on the end card before the world
 *  whispers its secret. */
const STILLNESS_MS = 20000;
/** The full secret beat: fall (7.5s) → line (at 8s) → return to the void. */
const RETURN_MS = 14500;

/** The post-credits secret: linger at the very end without moving, and the
 *  seed falls again — then the story folds back to its first frame. */
export function PostCredits() {
  const secretActive = useAppStore((s) => s.secretActive);
  const t = useT();
  const lastProgress = useRef(0);

  // Armed by stillness: 20s without scroll while parked on the end card.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = (): void => {
      clearTimeout(timer);
      const { progress } = useProgressStore.getState();
      const app = useAppStore.getState();
      if (progress > 0.985 && app.mode === "scroll" && app.started && !app.secretActive) {
        timer = setTimeout(() => useAppStore.getState().setSecret(true), STILLNESS_MS);
      }
    };
    const unsub = useProgressStore.subscribe(() => {
      const { progress } = useProgressStore.getState();
      if (Math.abs(progress - lastProgress.current) < 0.003) return;
      lastProgress.current = progress;
      if (progress < 0.97 && useAppStore.getState().secretActive) {
        useAppStore.getState().setSecret(false);
      }
      arm();
    });
    arm();
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  // Once active: the motif sighs as the seed lands, then the film rewinds.
  useEffect(() => {
    if (!secretActive) return;
    const motif = setTimeout(() => getAudioEngine()?.secretMotif(), 6800);
    const rewind = setTimeout(() => {
      scrollToProgress(0);
      useAppStore.getState().setSecret(false);
    }, RETURN_MS);
    return () => {
      clearTimeout(motif);
      clearTimeout(rewind);
    };
  }, [secretActive]);

  return (
    <AnimatePresence>
      {secretActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 2.2 } }}
          transition={{ duration: 4 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Deep dusk, but translucent at the heart — the falling ember must
              glow THROUGH the veil. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_center,rgba(2,3,8,0.55)_0%,rgba(2,3,8,0.92)_100%)]" />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 8, duration: 2.4 }}
            className="relative text-center"
          >
            <p className="font-display text-3xl text-white/90 sm:text-5xl">{t.secretLine}</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.5em] text-white/45">{t.secretSub}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
