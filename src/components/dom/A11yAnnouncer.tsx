"use client";

import { useActIndex } from "@/hooks/useActState";
import { ACTS } from "@/config/acts";

/** Screen-reader narration: announces each act as the journey reaches it. */
export function A11yAnnouncer() {
  const actIndex = useActIndex();
  const act = ACTS[actIndex];
  return (
    <div aria-live="polite" role="status" className="sr-only">
      {act ? `${act.title} — ${act.subtitle}. ${act.body}` : ""}
    </div>
  );
}
