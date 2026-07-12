"use client";

import { useLangStore, type Lang } from "@/stores/langStore";
import { ACT_COPY, UI, type ActCopy, type UiStrings } from "@/config/i18n";
import type { ActId } from "@/types/acts";

export function useLang(): Lang {
  return useLangStore((s) => s.lang);
}

/** UI strings for the active language. */
export function useT(): UiStrings {
  const lang = useLangStore((s) => s.lang);
  return UI[lang];
}

/** Act copy (title/subtitle/body) for the active language. */
export function useActCopy(id: ActId): ActCopy {
  const lang = useLangStore((s) => s.lang);
  return ACT_COPY[lang][id];
}
