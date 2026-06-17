"use client";

import { useAppStore } from "@/stores/appStore";

/** Shown while the WebGL context is lost; the composer rebuilds on restore. */
export function ContextLossOverlay() {
  const contextLost = useAppStore((s) => s.contextLost);
  if (!contextLost) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020308]/90">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
        Le monde se reconstruit… (contexte graphique perdu)
      </p>
    </div>
  );
}
