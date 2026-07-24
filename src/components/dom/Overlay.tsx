"use client";

import { useScrollProgressMV } from "@/hooks/useScrollProgressMV";
import { ACTS } from "@/config/acts";
import { useAppStore } from "@/stores/appStore";
import { ActSection } from "./ActSection";

/** Fixed text layer over the canvas. One store→MotionValue bridge feeds every
 *  section; hidden entirely while exploring in free-roam. */
export function Overlay() {
  const progress = useScrollProgressMV();
  const mode = useAppStore((s) => s.mode);
  const started = useAppStore((s) => s.started);
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 transition-opacity duration-700 ${
        mode === "scroll" && started ? "opacity-100" : "opacity-0"
      }`}
    >
      {ACTS.map((act) => (
        <ActSection key={act.id} act={act} progress={progress} />
      ))}
    </div>
  );
}
