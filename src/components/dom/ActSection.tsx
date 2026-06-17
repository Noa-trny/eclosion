"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ActDef } from "@/types/acts";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

interface ActSectionProps {
  act: ActDef;
  progress: MotionValue<number>;
}

/** One act's text block: opacity/translate keyed to its progress window via a
 *  single shared MotionValue — styles update outside React entirely. */
export function ActSection({ act, progress }: ActSectionProps) {
  const { start, end } = act.range;
  const first = act.index === 0;
  const last = act.index === 7;
  const keys = [
    first ? 0 : start + 0.008,
    first ? 0.002 : start + 0.032,
    last ? 0.982 : end - 0.034,
    last ? 1 : end - 0.01,
  ];
  const opacity = useTransform(progress, keys, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, keys, [first ? 0 : 36, 0, 0, last ? 0 : -36]);

  const alignClass =
    act.align === "center"
      ? "items-center text-center"
      : act.align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <motion.section
      style={{ opacity, y }}
      className={`absolute inset-0 flex flex-col justify-center px-6 py-16 sm:px-14 md:px-24 ${alignClass}`}
      aria-hidden={act.index !== 0 ? undefined : false}
    >
      <p className="mb-3 text-[11px] uppercase tracking-[0.5em] text-white/45 sm:text-xs">
        Acte {ROMAN[act.index]} — {act.subtitle}
      </p>
      <h2 className="font-display text-5xl leading-none tracking-tight text-white/95 sm:text-7xl md:text-8xl">
        {act.title}
      </h2>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
        {act.body}
      </p>
    </motion.section>
  );
}
