"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { getLenis } from "@/lib/scrollControl";
import { useT } from "@/hooks/useLang";

/** (seconds, progress) beats. The trailer is DIRECTED, not linear: it lingers
 *  where the film is strongest — first lightning, the dive, the whale, the
 *  crater flyover — and breathes between them. */
const BEATS: Array<[number, number]> = [
  [0, 0],
  [2, 0.004], // a held breath in the void
  [10, 0.13], // push-in on the seed
  [21, 0.27], // the firefly glide
  [29, 0.375], // storm entry
  [33.5, 0.397], // slow-motion: lightning writes its borders
  [40, 0.48], // the run to the shore
  [48, 0.535], // the dive, stretched
  [56, 0.585], // deep blue — the giant passes
  [65, 0.675], // volcano climb
  [72, 0.715], // slow over the crater's molten heart
  [76, 0.75], // sweep out
  [84, 0.83], // the meadow blooms
  [93, 0.94], // the sun crests
  [101, 1], // le Souffle
];

function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function paceProgress(t: number): number {
  const last = BEATS[BEATS.length - 1];
  if (!last || t >= last[0]) return 1;
  if (t <= 0) return 0;
  for (let i = 1; i < BEATS.length; i++) {
    const a = BEATS[i - 1];
    const b = BEATS[i];
    if (a && b && t <= b[0]) {
      const u = (t - a[0]) / Math.max(0.001, b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * easeInOutSine(u);
    }
  }
  return 1;
}

/** Trailer mode: drives the REAL scroll along the beat curve, so every system
 *  (timeline, audio, lightning) behaves exactly as in a hand-scrolled pass.
 *  Any gesture from the visitor hands control straight back. */
export function CinematicController() {
  const cinema = useAppStore((s) => s.cinema);
  const t = useT();

  useEffect(() => {
    if (!cinema) return;
    const t0 = performance.now();
    let raf = 0;
    const stop = (): void => useAppStore.getState().setCinema(false);
    const tick = (): void => {
      const p = paceProgress((performance.now() - t0) / 1000);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(p * max, { immediate: true });
      else window.scrollTo(0, p * max);
      if (p >= 1) {
        stop();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const cancel = (): void => stop();
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [cinema]);

  return (
    <AnimatePresence>
      {cinema && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          // Raised on phones: the HUD pills own the bottom edge there.
          className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 sm:bottom-6"
        >
          <button
            type="button"
            onClick={() => useAppStore.getState().setCinema(false)}
            className="pointer-events-auto rounded-full border border-white/25 bg-black/30 px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] text-white/70 backdrop-blur transition hover:border-white/60 hover:text-white"
          >
            ■ {t.trailerExit}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
