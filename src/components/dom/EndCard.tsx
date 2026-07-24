"use client";

import { useState } from "react";
import { motion, useTransform } from "motion/react";
import { useScrollProgressMV } from "@/hooks/useScrollProgressMV";
import { useAppStore } from "@/stores/appStore";
import { scrollToProgress } from "@/lib/scrollControl";
import { useT } from "@/hooks/useLang";
import { useCoarse, stripKey } from "@/hooks/useCoarse";

/** The closing card, revealed by the last breath of scroll: the title earns
 *  its meaning, then offers two doors — replay, or inhabit the world. */
export function EndCard() {
  const progress = useScrollProgressMV();
  const opacity = useTransform(progress, [0.972, 0.995], [0, 1]);
  const y = useTransform(progress, [0.972, 0.995], [30, 0]);
  const pointerEvents = useTransform(progress, (p) => (p > 0.985 ? "auto" : "none"));
  const mode = useAppStore((s) => s.mode);
  const secretActive = useAppStore((s) => s.secretActive);
  const requestModeToggle = useAppStore((s) => s.requestModeToggle);
  const [copied, setCopied] = useState(false);
  const t = useT();
  const coarse = useCoarse();

  const share = (): void => {
    // URL only — anything prepended would break pasting into an address bar.
    void navigator.clipboard?.writeText(window.location.origin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-700 ${
        mode === "scroll" && !secretActive ? "" : "!opacity-0 !pointer-events-none"
      }`}
    >
      {/* Radial scrim: the sunrise stays visible at the edges, but the card's
          heart sits on a quiet pool of darkness — legibility over the sun. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_center,rgba(2,3,8,0.62)_0%,rgba(2,3,8,0.35)_55%,transparent_80%)]"
      />
      <motion.div style={{ y }} className="relative flex flex-col items-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.6em] text-white/75 drop-shadow-[0_1px_8px_rgba(2,3,8,0.9)]">
          {t.endKicker}
        </p>
        <h2 className="font-display text-6xl tracking-[0.16em] text-white drop-shadow-[0_2px_18px_rgba(2,3,8,0.85)] sm:text-8xl">
          ÉCLOSION
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(2,3,8,0.9)]">
          {t.endBody}
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollToProgress(0)}
            className="rounded-full border border-white/50 bg-white/90 px-7 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black transition hover:bg-white"
          >
            {t.replay}
          </button>
          <button
            type="button"
            onClick={requestModeToggle}
            className="rounded-full border border-white/30 bg-black/20 px-7 py-3 text-xs uppercase tracking-[0.25em] text-white/85 backdrop-blur transition hover:border-white/70 hover:text-white"
          >
            {coarse ? stripKey(t.exploreWorld) : t.exploreWorld}
          </button>
        </div>
        <button
          type="button"
          onClick={share}
          className="mt-5 text-[11px] uppercase tracking-[0.3em] text-white/50 underline-offset-4 transition hover:text-white hover:underline"
        >
          {copied ? t.shared : t.share}
        </button>
        <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-white/45 drop-shadow-[0_1px_6px_rgba(2,3,8,0.9)]">
          {t.credits}
        </p>
      </motion.div>
    </motion.div>
  );
}
