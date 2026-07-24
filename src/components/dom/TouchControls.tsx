"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { useCoarse } from "@/hooks/useCoarse";
import { pushLook, resetTouchInput, touchInput } from "@/lib/touchInput";

const RADIUS = 52;

/** Touch free-roam controls: a virtual joystick (movement) and a full-screen
 *  drag surface (look). Only mounted on coarse pointers while exploring. */
export function TouchControls() {
  const mode = useAppStore((s) => s.mode);
  const thumbRef = useRef<HTMLDivElement>(null);
  const joyPointer = useRef<number | null>(null);
  const joyOrigin = useRef({ x: 0, y: 0 });
  const lookPointer = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0 });
  const coarse = useCoarse();
  const active = mode === "free" && coarse;

  useEffect(() => {
    if (!active) resetTouchInput();
    return () => resetTouchInput();
  }, [active]);

  const setThumb = (dx: number, dy: number): void => {
    if (thumbRef.current) thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-20 touch-none"
        >
          {/* Look surface — every drag that is NOT the joystick steers the gaze. */}
          <div
            className="absolute inset-0"
            onPointerDown={(e) => {
              if (lookPointer.current !== null) return;
              lookPointer.current = e.pointerId;
              lookLast.current = { x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (lookPointer.current !== e.pointerId) return;
              pushLook(e.clientX - lookLast.current.x, e.clientY - lookLast.current.y);
              lookLast.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              if (lookPointer.current === e.pointerId) lookPointer.current = null;
            }}
            onPointerCancel={(e) => {
              if (lookPointer.current === e.pointerId) lookPointer.current = null;
            }}
          />
          {/* Virtual joystick — bottom-left, thumb-reachable. */}
          <div
            className="absolute bottom-24 left-6 h-[120px] w-[120px] rounded-full border border-white/25 bg-black/25 backdrop-blur-sm"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
            onPointerDown={(e) => {
              joyPointer.current = e.pointerId;
              const rect = e.currentTarget.getBoundingClientRect();
              joyOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
              e.currentTarget.setPointerCapture(e.pointerId);
              e.stopPropagation();
            }}
            onPointerMove={(e) => {
              if (joyPointer.current !== e.pointerId) return;
              let dx = e.clientX - joyOrigin.current.x;
              let dy = e.clientY - joyOrigin.current.y;
              const len = Math.hypot(dx, dy);
              if (len > RADIUS) {
                dx = (dx / len) * RADIUS;
                dy = (dy / len) * RADIUS;
              }
              touchInput.move.x = dx / RADIUS;
              touchInput.move.y = -dy / RADIUS;
              setThumb(dx, dy);
            }}
            onPointerUp={() => {
              joyPointer.current = null;
              touchInput.move.x = 0;
              touchInput.move.y = 0;
              setThumb(0, 0);
            }}
            onPointerCancel={() => {
              joyPointer.current = null;
              touchInput.move.x = 0;
              touchInput.move.y = 0;
              setThumb(0, 0);
            }}
          >
            <div
              ref={thumbRef}
              className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full border border-white/40 bg-white/20"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
