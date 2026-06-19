"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useAppStore } from "@/stores/appStore";

/** Custom cursor: an instant dot + a spring-lagged ring that swells over
 *  interactive elements. Fine pointers only; the native cursor returns in
 *  the editor and under pointer lock (free-roam). */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [locked, setLocked] = useState(false);
  const editorOpen = useAppStore((s) => s.editorOpen);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 400, damping: 35 });
  const ringY = useSpring(y, { stiffness: 400, damping: 35 });

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const active = enabled && !reducedMotion && !editorOpen && !locked;

  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove("custom-cursor");
      return;
    }
    document.documentElement.classList.add("custom-cursor");
    const onMove = (e: PointerEvent): void => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: MouseEvent): void => {
      setHovering(!!(e.target as HTMLElement | null)?.closest("button, a, [role=button]"));
    };
    const onLock = (): void => setLocked(document.pointerLockElement !== null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("pointerlockchange", onLock);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("pointerlockchange", onLock);
    };
  }, [active, x, y]);

  useEffect(() => {
    const onLock = (): void => setLocked(document.pointerLockElement !== null);
    document.addEventListener("pointerlockchange", onLock);
    return () => document.removeEventListener("pointerlockchange", onLock);
  }, []);

  if (!active) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
      />
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hovering ? 1.7 : 1, opacity: hovering ? 0.9 : 0.5 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white mix-blend-difference"
      />
    </>
  );
}
