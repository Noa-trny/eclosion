"use client";

import { useLangStore } from "@/stores/langStore";
import { useAppStore } from "@/stores/appStore";

/** FR/EN switch — always reachable, including on the start screen. */
export function LangToggle() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const mode = useAppStore((s) => s.mode);
  if (mode === "free") return null;

  return (
    <div className="fixed right-5 top-4 z-[55] flex items-center gap-1 text-[11px] uppercase tracking-[0.25em]">
      {(["fr", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1.5 transition ${
            lang === code ? "text-white" : "text-white/35 hover:text-white/70"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
