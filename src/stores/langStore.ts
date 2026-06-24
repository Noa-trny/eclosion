import { create } from "zustand";

export type Lang = "fr" | "en";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/** French is the canonical voice; English opens the narrative to
 *  international juries. Choice persists; first visit follows the browser. */
export const useLangStore = create<LangState>((set) => ({
  lang: "fr",
  setLang: (lang) => {
    set({ lang });
    try {
      window.localStorage.setItem("eclosion-lang", lang);
      document.documentElement.lang = lang;
    } catch {
      // Storage blocked — the choice just won't persist.
    }
  },
}));

/** Client-side init: stored preference, else browser language. */
export function initLang(): void {
  try {
    const stored = window.localStorage.getItem("eclosion-lang");
    const lang: Lang =
      stored === "fr" || stored === "en"
        ? stored
        : navigator.language.toLowerCase().startsWith("fr")
          ? "fr"
          : "en";
    useLangStore.getState().setLang(lang);
  } catch {
    // Keep the French default.
  }
}
