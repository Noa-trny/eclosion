"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ActDef } from "@/types/acts";
import { useActCopy, useT } from "@/hooks/useLang";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

interface ActSectionProps {
  act: ActDef;
  progress: MotionValue<number>;
}

/** One act's text block: opacity/translate keyed to its progress window via a
 *  single shared MotionValue — styles update outside React entirely. */
export function ActSection({ act, progress }: ActSectionProps) {
  const copy = useActCopy(act.id);
  const t = useT();
  const { start, end } = act.range;
  const first = act.index === 0;
  const last = act.index === 7;
  // The last act hands the screen to the EndCard before progress reaches 1.
  const keys = [
    first ? 0 : start + 0.008,
    first ? 0.002 : start + 0.032,
    last ? 0.938 : end - 0.034,
    last ? 0.966 : end - 0.01,
  ];
  const opacity = useTransform(progress, keys, [first ? 1 : 0, 1, 1, 0]);
  const y = useTransform(progress, keys, [first ? 0 : 36, 0, 0, -36]);

  const alignClass =
    act.align === "center"
      ? "items-center text-center"
      : act.align === "right"
        ? "items-end text-right"
        : "items-start text-left";
  // Phones: the 3D subject owns the middle of a portrait frame — side-aligned
  // copy drops to the lower third (above the HUD), centered acts stay centered.
  const flowClass =
    act.align === "center"
      ? "justify-center"
      : "justify-end pb-36 sm:justify-center sm:pb-16";

  return (
    <motion.section
      style={{ opacity, y }}
      className={`absolute inset-0 flex flex-col px-6 py-16 sm:px-14 md:px-24 ${alignClass} ${flowClass}`}
      aria-hidden={act.index !== 0 ? undefined : false}
    >
      <p className="mb-3 text-[11px] uppercase tracking-[0.5em] text-white/45 sm:text-xs">
        {t.act} {ROMAN[act.index]} — {copy.subtitle}
      </p>
      {/* The visible title now lives IN the 3D world (ActTitles); this copy
          stays for screen readers and the /fallback route keeps its own. */}
      <h2 className="sr-only">{copy.title}</h2>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
        {copy.body}
      </p>
    </motion.section>
  );
}
