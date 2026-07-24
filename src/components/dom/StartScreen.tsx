"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { initAudioEngine } from "@/audio/engine";
import { useT } from "@/hooks/useLang";

const TITLE = "ÉCLOSION";
/** The seed's double-thump, shared by every pulsing element on the page. */
const HEARTBEAT = { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, times: [0, 0.12, 0.24, 0.34, 1] };

/** The gate: unlocks audio inside the click gesture, then hands the visitor
 *  to the scroll. A poster, not a form — the void's starfield breathes behind
 *  a veil, the layers parallax with the pointer, and everything pulses to the
 *  seed's heartbeat. */
export function StartScreen() {
  const phase = useAppStore((s) => s.phase);
  const started = useAppStore((s) => s.started);
  const start = useAppStore((s) => s.start);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const t = useT();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const titleX = useTransform(mx, (v) => v * -18);
  const titleY = useTransform(my, (v) => v * -10);
  const frameX = useTransform(mx, (v) => v * 8);
  const frameY = useTransform(my, (v) => v * 5);

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
          onPointerMove={(e) => {
            if (reducedMotion) return;
            mx.set(e.clientX / window.innerWidth - 0.5);
            my.set(e.clientY / window.innerHeight - 0.5);
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        >
          {/* Veil, not wall: the pre-start starfield glints through. */}
          <div aria-hidden className="absolute inset-0 bg-[#020308]/70" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_130%_75%_at_50%_118%,rgba(255,166,72,0.13)_0%,rgba(120,60,120,0.05)_40%,transparent_62%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_center,transparent_50%,rgba(2,3,8,0.85)_100%)]"
          />

          {/* The poster's frame: a hairline and four corner ticks, drifting
              slightly AGAINST the pointer for depth. */}
          <motion.div
            aria-hidden
            style={reducedMotion ? undefined : { x: frameX, y: frameY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.6 }}
            className="pointer-events-none absolute inset-4 sm:inset-6"
          >
            <div className="absolute inset-0 border border-white/[0.07]" />
            {[
              "left-[-1px] top-[-1px] border-l border-t",
              "right-[-1px] top-[-1px] border-r border-t",
              "left-[-1px] bottom-[-1px] border-l border-b",
              "right-[-1px] bottom-[-1px] border-r border-b",
            ].map((corner) => (
              <div key={corner} className={`absolute h-5 w-5 border-white/40 ${corner}`} />
            ))}
          </motion.div>

          <motion.div
            style={reducedMotion ? undefined : { x: titleX, y: titleY }}
            className="relative flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="mb-7 max-w-[80vw] text-[10px] uppercase tracking-[0.4em] text-white/40 sm:max-w-none sm:tracking-[0.65em] sm:text-[11px]"
            >
              {t.tagline}
            </motion.p>

            {/* The seed's heartbeat, before a single pixel of 3D: a double-thump
                pulse of scale + warm glow behind the title. */}
            <div className="relative">
              {!reducedMotion && (
                <motion.div
                  aria-hidden
                  animate={{ opacity: [0.14, 0.42, 0.18, 0.34, 0.14] }}
                  transition={HEARTBEAT}
                  className="absolute inset-[-35%] rounded-full bg-[radial-gradient(circle,rgba(255,184,92,0.4)_0%,transparent_62%)] blur-2xl"
                />
              )}
              <motion.h1
                animate={reducedMotion ? {} : { scale: [1, 1.012, 1, 1.007, 1] }}
                transition={{ scale: HEARTBEAT }}
                className="font-display relative flex text-[15vw] leading-none tracking-[0.14em] sm:text-[7.5rem] md:text-[9rem]"
              >
                {/* Gradient per LETTER: background-clip:text breaks when child
                    spans carry their own transform/filter layers. */}
                {TITLE.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.5 + i * 0.09, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-gradient-to-b from-white via-white to-[#f4c98a] bg-clip-text text-transparent"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1.2 }}
              className="mt-6 max-w-md text-sm leading-relaxed text-white/60"
            >
              {t.intro}
            </motion.p>

            {/* Light gathering to a point: the ember, held by two threads. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 1.2 }}
              className="mt-9 flex items-center gap-3"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8, duration: 1.4, ease: "easeOut" }}
                className="h-px w-20 origin-right bg-gradient-to-l from-white/40 to-transparent"
              />
              <motion.div
                animate={reducedMotion ? {} : { opacity: [0.5, 1, 0.6, 0.9, 0.5], scale: [1, 1.25, 1, 1.15, 1] }}
                transition={HEARTBEAT}
                className="h-1.5 w-1.5 rounded-full bg-[#ffd9a0] shadow-[0_0_14px_4px_rgba(255,190,110,0.45)]"
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8, duration: 1.4, ease: "easeOut" }}
                className="h-px w-20 origin-left bg-gradient-to-r from-white/40 to-transparent"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1, duration: 0.9 }}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
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
                    className="rounded-full border border-[#ffe3b8]/70 bg-gradient-to-b from-white to-[#ffedd6] px-9 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-black shadow-[0_0_22px_rgba(255,200,140,0.18)] transition duration-300 hover:scale-[1.04] hover:shadow-[0_0_34px_rgba(255,210,150,0.4)]"
                  >
                    {reducedMotion ? t.enter : t.enterSound}
                  </button>
                  <button
                    type="button"
                    onClick={() => enter(false)}
                    className="rounded-full border border-white/25 px-9 py-3.5 text-xs uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm transition duration-300 hover:scale-[1.04] hover:border-white/60 hover:text-white"
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
                transition={{ delay: 2.6, duration: 1 }}
                className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/45 underline-offset-4 transition hover:text-white hover:underline"
              >
                ▶ {t.trailer}
              </motion.button>
            )}

            {reducedMotion && <p className="mt-6 text-[11px] text-white/35">{t.reducedNote}</p>}
          </motion.div>

          <p className="absolute bottom-8 text-[10px] uppercase tracking-[0.3em] text-white/25 sm:bottom-10">
            {t.footer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
