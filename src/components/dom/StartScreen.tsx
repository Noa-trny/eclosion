"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { initAudioEngine } from "@/audio/engine";
import { useT } from "@/hooks/useLang";

/** The gate: unlocks audio inside the click gesture, then hands the visitor
 *  to the scroll. Until dismissed, Lenis stays frozen. */
export function StartScreen() {
  const phase = useAppStore((s) => s.phase);
  const started = useAppStore((s) => s.started);
  const start = useAppStore((s) => s.start);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const t = useT();

  const enter = (withAudio: boolean): void => {
    if (withAudio) initAudioEngine();
    start(withAudio);
  };

  return (
    <AnimatePresence>
      {!started && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020308] px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            className="mb-5 text-[11px] uppercase tracking-[0.6em] text-white/40"
          >
            {t.tagline}
          </motion.p>
          {/* The seed's heartbeat, before a single pixel of 3D: a double-thump
              pulse of scale + warm glow behind the title. */}
          <div className="relative">
            {!reducedMotion && (
              <motion.div
                aria-hidden
                animate={{ opacity: [0.12, 0.4, 0.16, 0.32, 0.12] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.12, 0.24, 0.34, 1] }}
                className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(255,184,92,0.35)_0%,transparent_65%)] blur-xl"
              />
            )}
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              animate={
                reducedMotion
                  ? { opacity: 1, letterSpacing: "0.18em" }
                  : { opacity: 1, letterSpacing: "0.18em", scale: [1, 1.014, 1, 1.008, 1] }
              }
              transition={{
                opacity: { delay: 0.5, duration: 1.6, ease: "easeOut" },
                letterSpacing: { delay: 0.5, duration: 1.6, ease: "easeOut" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.12, 0.24, 0.34, 1] },
              }}
              className="font-display relative text-6xl text-white sm:text-8xl"
            >
              ÉCLOSION
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1.2 }}
            className="mt-4 max-w-sm text-sm leading-relaxed text-white/55"
          >
            {t.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.9 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            {phase === "boot" ? (
              <motion.p
                animate={{ opacity: [0.35, 0.75, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-xs uppercase tracking-[0.3em] text-white/50"
              >
                {t.sprouting}
              </motion.p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => enter(!reducedMotion)}
                  className="rounded-full border border-white/60 bg-white/95 px-8 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black transition hover:bg-white"
                >
                  {reducedMotion ? t.enter : t.enterSound}
                </button>
                <button
                  type="button"
                  onClick={() => enter(false)}
                  className="rounded-full border border-white/25 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-white/60 hover:text-white"
                >
                  {t.enterQuiet}
                </button>
              </>
            )}
          </motion.div>

          {reducedMotion && <p className="mt-6 text-[11px] text-white/35">{t.reducedNote}</p>}
          <p className="absolute bottom-6 text-[10px] uppercase tracking-[0.3em] text-white/25">
            {t.footer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
