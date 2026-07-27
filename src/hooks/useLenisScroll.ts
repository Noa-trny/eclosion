"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { LENIS_LERP } from "@/config/scroll";
import { buildMasterTimeline } from "@/timelines/masterTimeline";
import { decayVelocity, writeProgress } from "@/stores/progressStore";
import { useAppStore } from "@/stores/appStore";
import { registerLenis } from "@/lib/scrollControl";

/** The sync contract everything depends on:
 *  Lenis is the ONLY smoothing (scrub stays `true`), gsap.ticker drives
 *  lenis.raf, and one master ScrollTrigger scrubs the master timeline while
 *  transiently writing progress. StrictMode-safe: every side effect below has
 *  a symmetric cleanup. */
export function useLenisScroll(smooth: boolean): void {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const timeline = buildMasterTimeline();

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (smooth) {
      lenis = new Lenis({ autoRaf: false, lerp: LENIS_LERP, syncTouch: true });
      lenis.on("scroll", ScrollTrigger.update);
      let last = 0;
      tick = (time: number) => {
        lenis?.raf(time * 1000);
        decayVelocity(last ? Math.min(time - last, 0.05) : 0.016);
        last = time;
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      registerLenis(lenis);
      // The start screen gates scrolling; Lenis resumes on `started`.
      if (!useAppStore.getState().started) lenis.stop();
    }

    const trigger = ScrollTrigger.create({
      trigger: "#scroll-spacer",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      animation: timeline,
      onUpdate: (self) => writeProgress(self.progress, self.getVelocity()),
    });

    const unsubscribeStart = useAppStore.subscribe((state, prev) => {
      if (state.started && !prev.started) {
        lenis?.start();
        ScrollTrigger.refresh();
      }
    });

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = (): void => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    // Force an initial sync so a reloaded page mid-scroll lands on the right act.
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      unsubscribeStart();
      trigger.kill();
      timeline.kill();
      if (tick) gsap.ticker.remove(tick);
      if (lenis) {
        registerLenis(null);
        lenis.destroy();
      }
    };
  }, [smooth]);
}
