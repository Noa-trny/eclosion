"use client";

import { useActIndex } from "@/hooks/useActState";
import { useAppStore } from "@/stores/appStore";
import { ACTS } from "@/config/acts";
import { scrollToProgress } from "@/lib/scrollControl";
import { useLang, useT } from "@/hooks/useLang";
import { useCoarse, stripKey } from "@/hooks/useCoarse";
import { capturePhoto } from "@/lib/photo";
import { ACT_COPY } from "@/config/i18n";

/** Persistent chrome: act dots (right rail on desktop, bottom on touch),
 *  audio toggle and the free-roam switch. */
export function Hud() {
  const actIndex = useActIndex();
  const started = useAppStore((s) => s.started);
  const audioOn = useAppStore((s) => s.audioOn);
  const mode = useAppStore((s) => s.mode);
  const toggleAudio = useAppStore((s) => s.toggleAudio);
  const requestModeToggle = useAppStore((s) => s.requestModeToggle);
  const t = useT();
  const lang = useLang();
  const coarse = useCoarse();
  if (!started) return null;

  const inScroll = mode === "scroll";
  // Touch keyboards don't exist: drop the "(F)" hints there.
  const modeLabel = inScroll ? t.explore : t.resume;

  return (
    <>
      {/* Act navigation dots — right rail on desktop, top strip on touch
          (the phone's bottom edge belongs to the HUD pills). Generous hit
          areas: the visible dot sits inside a padded button. */}
      {inScroll && (
        <nav
          aria-label={t.acts}
          className="fixed left-3 top-3 z-30 flex flex-row gap-1 sm:left-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:gap-1.5 md:right-6"
        >
          {ACTS.map((act) => (
            <button
              key={act.id}
              type="button"
              title={ACT_COPY[lang][act.id].title}
              aria-label={`${ACT_COPY[lang][act.id].title} — ${t.goToAct} ${act.index + 1}`}
              aria-current={act.index === actIndex}
              onClick={() => scrollToProgress(act.range.start + 0.012)}
              className="group p-1.5"
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full border border-white/50 transition-all duration-500 ${
                  act.index === actIndex ? "scale-125 bg-white" : "bg-white/10 group-hover:bg-white/40"
                }`}
              />
            </button>
          ))}
        </nav>
      )}

      {/* Bottom-right controls. */}
      <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2.5">
        {/* Touch free-roam has no P key — give the photo its own button. */}
        {coarse && mode === "free" && (
          <button
            type="button"
            onClick={capturePhoto}
            className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur transition hover:border-white/50 hover:text-white"
          >
            {t.photo}
          </button>
        )}
        <button
          type="button"
          onClick={toggleAudio}
          aria-pressed={audioOn}
          aria-label={audioOn ? t.muteLabel : t.unmuteLabel}
          className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur transition hover:border-white/50 hover:text-white"
        >
          {audioOn ? t.soundOn : t.muted}
        </button>
        <button
          type="button"
          onClick={requestModeToggle}
          disabled={mode === "toScroll" || mode === "toFree"}
          className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur transition hover:border-white/50 hover:text-white disabled:opacity-40"
        >
          {coarse ? stripKey(modeLabel) : modeLabel}
        </button>
      </div>
    </>
  );
}
