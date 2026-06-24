"use client";

import { useAppStore } from "@/stores/appStore";
import { useT } from "@/hooks/useLang";

/** Shown while the WebGL context is lost; the composer rebuilds on restore. */
export function ContextLossOverlay() {
  const contextLost = useAppStore((s) => s.contextLost);
  const t = useT();
  if (!contextLost) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020308]/90">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t.contextLost}</p>
    </div>
  );
}
