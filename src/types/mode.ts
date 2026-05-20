/** scroll: the narrative timeline drives everything.
 *  toFree/toScroll: transition states while the camera hands over.
 *  free: FPS/orbit exploration, weather simulation takes over. */
export type AppMode = "scroll" | "toFree" | "free" | "toScroll";

export type AppPhase = "boot" | "ready" | "running";
