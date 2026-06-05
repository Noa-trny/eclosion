"use client";

import { SCROLL_PAGES } from "@/config/scroll";

/** The invisible scroll spacer — the film's total runtime in viewport heights.
 *  Canvas and overlays are fixed; this is the only thing that "scrolls". */
export function DomRoot() {
  return <div id="scroll-spacer" style={{ height: `${SCROLL_PAGES * 100}dvh` }} aria-hidden />;
}
