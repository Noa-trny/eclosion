"use client";

import { useEffect } from "react";
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

  const enter = (withAudio: boolean): void => {
    if (withAudio) initAudioEngine();
    start(withAudio);
  };

  const enterTrailer = (): void => {
    initAudioEngine();
    start(true);
    useAppStore.getState().setCinema(true);
  };

  // Screensaver: a minute of stillness on the ready gate and the film starts
  // showing itself — muted (no gesture, no AudioContext), looping.
  useEffect(() => {
    if (started || phase === "boot" || reducedMotion) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // ?saver shortens the idle delay for dev verification.
    const delay = new URLSearchParams(window.location.search).has("saver") ? 5000 : 60000;
    const arm = (): void => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const app = useAppStore.getState();
        app.start(false);
        app.setScreensaver(true);
        app.setCinema(true);
      }, delay);
    };
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, arm, { passive: true });
    arm();
    return () => {
      clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, arm);
    };
  }, [started, phase, reducedMotion]);

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
          <div aria-hidden className="absolute inset-0 bg-[#020308]/55" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_center,transparent_50%,rgba(2,3,8,0.85)_100%)]"
          />

          <motion.div
            style={reducedMotion ? undefined : { x: titleX, y: titleY }}
            className="relative flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="mb-7 max-w-[80vw] text-[10px] uppercase tracking-[0.4em] text-white/55 sm:max-w-none sm:tracking-[0.65em] sm:text-[11px]"
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
                className="font-display relative flex text-[15vw] leading-none tracking-[0.14em] text-white sm:text-[8.5rem] md:text-[10rem]"
              >
                {/* Gradient per LETTER (background-clip:text breaks when child
                    spans carry their own transform/filter layers). CSS-animated:
                    JS staggering froze mid-word during first-load compiles. */}
                {TITLE.split("").map((letter, i) => (
                  <span
                    key={i}
                    className={`drop-shadow-[0_0_26px_rgba(255,228,180,0.45)] ${reducedMotion ? "" : "letter-rise"}`}
                    style={reducedMotion ? undefined : { animationDelay: `${0.5 + i * 0.09}s` }}
                  >
                    {letter}
                  </span>
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


            {/* Boot indicator: OUTSIDE any JS-delayed entrance and CSS-only —
                shader compiles freeze the main thread, and this must be
                visible and spinning exactly then. */}
            {phase === "boot" && (
              <div className="fade-in mt-9 flex flex-col items-center gap-4">
                <div
                  aria-hidden
                  className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-[#ffd9a0]"
                />
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t.sprouting}</p>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.9 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
            >
              {phase !== "boot" && (
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
                    className="rounded-full border border-white/30 bg-black/20 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/85 backdrop-blur transition duration-300 hover:scale-[1.03] hover:border-white/70 hover:text-white"
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

          <p className="absolute bottom-8 text-[10px] uppercase tracking-[0.3em] text-white/40 sm:bottom-10">
            {t.footer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
