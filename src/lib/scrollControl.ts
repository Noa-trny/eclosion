import type Lenis from "lenis";

/** Module-level handle so the mode machine and key bindings can freeze/resume
 *  the virtual scroll without threading the Lenis instance through React. */
let lenisInstance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null): void {
  lenisInstance = lenis;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Freezing Lenis pins scrollTop — ScrollTrigger (and thus the whole timeline)
 *  stays exactly at the current progress with zero re-sync math needed. */
export function stopScroll(): void {
  lenisInstance?.stop();
}

export function startScroll(): void {
  lenisInstance?.start();
}

export function scrollByViewport(fraction: number): void {
  if (typeof window === "undefined") return;
  const delta = window.innerHeight * fraction;
  if (lenisInstance) {
    lenisInstance.scrollTo(lenisInstance.scroll + delta, { duration: 0.9 });
  } else {
    window.scrollBy({ top: delta, behavior: "smooth" });
  }
}

/** Smooth-scrolls to an absolute narrative progress (0..1) — act dots. */
export function scrollToProgress(progress: number): void {
  if (typeof window === "undefined") return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(1, progress)) * max;
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { duration: 2.4 });
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
  }
}
