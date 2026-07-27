"use client";

import { useActIndex } from "@/hooks/useActState";
import { ACTS } from "@/config/acts";
import { useLang } from "@/hooks/useLang";
import { ACT_COPY } from "@/config/i18n";

/** Screen-reader narration: announces each act as the journey reaches it. */
export function A11yAnnouncer() {
  const actIndex = useActIndex();
  const lang = useLang();
  const act = ACTS[actIndex];
  const copy = act ? ACT_COPY[lang][act.id] : null;
  return (
    <div aria-live="polite" role="status" className="sr-only">
      {copy ? `${copy.title} - ${copy.subtitle}. ${copy.body}` : ""}
    </div>
  );
}
