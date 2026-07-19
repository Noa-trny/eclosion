"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { useT } from "@/hooks/useLang";

/** Shutter feedback: a brief white flash + a small confirmation toast. */
export function PhotoFlash() {
  const photoNonce = useAppStore((s) => s.photoNonce);
  const [visible, setVisible] = useState(false);
  const t = useT();

  useEffect(() => {
    if (photoNonce === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [photoNonce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div key={photoNonce} className="pointer-events-none fixed inset-0 z-[65]">
          <motion.div
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 bg-white"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/80 backdrop-blur"
          >
            {t.photoSaved}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
