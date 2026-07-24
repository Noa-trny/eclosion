"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HAIKUS, useHaikuStore } from "@/lib/haikus";
import { useLang, useT } from "@/hooks/useLang";
import { ACTS } from "@/config/acts";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** The found haiku, presented like a pressed flower: three lines in Fraunces,
 *  the collection count beneath. Dismisses on tap or on its own. */
export function HaikuCard() {
  const reveal = useHaikuStore((s) => s.reveal);
  const collected = useHaikuStore((s) => s.collected);
  const closeReveal = useHaikuStore((s) => s.closeReveal);
  const lang = useLang();
  const t = useT();

  useEffect(() => {
    if (!reveal) return;
    const timer = setTimeout(closeReveal, 8000);
    return () => clearTimeout(timer);
  }, [reveal, closeReveal]);

  const actIndex = ACTS.findIndex((a) => a.id === reveal);

  return (
    <AnimatePresence>
      {reveal && (
        <motion.button
          type="button"
          onClick={closeReveal}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm border border-white/15 bg-black/55 px-10 py-8 text-center backdrop-blur-md"
        >
          <p className="mb-4 text-[9px] uppercase tracking-[0.5em] text-[#ffd9a0]/70">
            {ROMAN[actIndex] ?? ""} — {t.haikuKicker}
          </p>
          {HAIKUS[reveal][lang].map((line, i) => (
            <p key={i} className="font-display text-xl leading-relaxed text-white/90 sm:text-2xl">
              {line}
            </p>
          ))}
          <p className="mt-5 text-[9px] uppercase tracking-[0.4em] text-white/40">
            {collected.length} / 8
          </p>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
