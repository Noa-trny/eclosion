"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { initAudioEngine } from "@/audio/engine";
import { useT } from "@/hooks/useLang";

const TITLE = "ÉCLOSION";

/** The gate: unlocks audio inside the click gesture, then hands the visitor
 *  to the scroll. Semi-translucent — the void's starfield lives BEHIND the
 *  words, so the world is already breathing before entry. */
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

  const enterTrailer = (): void => {
    initAudioEngine();
    start(true);
    useAppStore.getState().setCinema(true);
  };

  return (
    <AnimatePresence>
      {!started && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        >
          {/* Veil, not wall: the pre-start starfield glints through. */}
          <div aria-hidden className="absolute inset-0 bg-[#020308]/75" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_130%_80%_at_50%_115%,rgba(255,170,80,0.07)_0%,transparent_55%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_90%_90%_at_center,transparent_55%,rgba(2,3,8,0.8)_100%)]"
          />

          <div className="relative flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="mb-6 text-[11px] uppercase tracking-[0.6em] text-white/40"
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
                animate={reducedMotion ? {} : { scale: [1, 1.014, 1, 1.008, 1] }}
                transition={{ scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.12, 0.24, 0.34, 1] } }}
                className="font-display relative flex text-6xl tracking-[0.18em] text-white sm:text-8xl"
              >
                {TITLE.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.5 + i * 0.09, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1.2 }}
              className="mt-5 max-w-sm text-sm leading-relaxed text-white/55"
            >
              {t.intro}
            </motion.p>

            {/* An ornament, not a rule: light gathering to a point. */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.7, duration: 1.4, ease: "easeOut" }}
              className="mt-8 h-px w-28 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.9 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
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
                    className="rounded-full border border-white/60 bg-white/95 px-8 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black transition duration-300 hover:scale-[1.04] hover:bg-white hover:shadow-[0_0_28px_rgba(255,220,170,0.25)]"
                  >
                    {reducedMotion ? t.enter : t.enterSound}
                  </button>
                  <button
                    type="button"
                    onClick={() => enter(false)}
                    className="rounded-full border border-white/25 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/70 transition duration-300 hover:scale-[1.04] hover:border-white/60 hover:text-white"
                  >
                    {t.enterQuiet}
                  </button>
                </>
              )}
            </motion.div>

            {phase !== "boot" && !reducedMotion && (
              <motion.button
                type="button"
                onClick={enterTrailer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/45 underline-offset-4 transition hover:text-white hover:underline"
              >
                ▶ {t.trailer}
              </motion.button>
            )}

            {reducedMotion && <p className="mt-6 text-[11px] text-white/35">{t.reducedNote}</p>}
          </div>

          <p className="absolute bottom-6 text-[10px] uppercase tracking-[0.3em] text-white/25">
            {t.footer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
