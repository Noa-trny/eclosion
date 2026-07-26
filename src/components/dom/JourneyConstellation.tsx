"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getConstellation, type JourneyStar } from "@/lib/journeyTrace";
import { useProgressStore } from "@/stores/progressStore";
import { useT } from "@/hooks/useLang";

const W = 340;
const H = 84;

/** The visitor's crossing drawn in the sky: each star a moment they lingered,
 *  joined in the order they were lived. Rendered on the end card once the
 *  trace has enough to say. */
export function JourneyConstellation() {
  const t = useT();
  // Frozen at ARRIVAL on the end card (the card itself never unmounts) and
  // re-armed if the visitor scrolls back up for another pass.
  const [stars, setStars] = useState<JourneyStar[]>([]);
  useEffect(() => {
    const update = (): void => {
      const progress = useProgressStore.getState().progress;
      setStars((prev) => {
        if (progress > 0.965 && prev.length === 0) return getConstellation();
        if (progress < 0.9 && prev.length > 0) return [];
        return prev;
      });
    };
    update();
    return useProgressStore.subscribe(update);
  }, []);
  if (stars.length === 0) return null;

  const points = stars.map((s) => [8 + s.x * (W - 16), 8 + s.y * (H - 16)] as const);

  return (
    <div className="mb-7 flex flex-col items-center">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <motion.polyline
          points={points.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="rgba(255, 236, 200, 0.35)"
          strokeWidth="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.6, delay: 0.8, ease: "easeInOut" }}
        />
        {points.map(([x, y], i) => {
          const star = stars[i];
          if (!star) return null;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={1 + star.w * 2.4}
              fill="#ffecc8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 + star.w * 0.55 }}
              transition={{ delay: 0.5 + (i / points.length) * 2.4, duration: 0.9 }}
              style={{ filter: "drop-shadow(0 0 4px rgba(255, 220, 160, 0.9))" }}
            />
          );
        })}
      </svg>
      <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-white/40">
        {t.journeyCaption}
      </p>
    </div>
  );
}
