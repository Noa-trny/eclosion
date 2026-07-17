/** Scroll length in viewport heights — the whole film plays over this. */
export const SCROLL_PAGES = 9;

/** Lenis is the ONLY scroll-value smoothing in the chain (ScrollTrigger scrub
 *  stays `true`); slightly lower lerp = silkier glide. */
export const LENIS_LERP = 0.08;

/** Keyboard scroll step as a fraction of one viewport height. */
export const KEY_SCROLL_STEP = 0.6;
