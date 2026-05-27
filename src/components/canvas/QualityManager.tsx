"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useQualityStore } from "@/stores/qualityStore";
import { detectTier } from "@/lib/webgl/detectTier";

/** Initial tier from a local GPU heuristic (no CDN benchmark fetch), then the
 *  PerformanceMonitor demotes DPR → tier on sustained low fps, with a floor at
 *  low so iOS Low Power Mode can't death-spiral the quality. */
export function QualityManager() {
  const gl = useThree((s) => s.gl);
  const setTier = useQualityStore((s) => s.setTier);
  const demote = useQualityStore((s) => s.demote);
  const promote = useQualityStore((s) => s.promote);

  useEffect(() => {
    setTier(detectTier(gl.getContext()));
  }, [gl, setTier]);

  return <PerformanceMonitor onDecline={demote} onIncline={promote} flipflops={3} />;
}
