"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { scrollByViewport } from "@/lib/scrollControl";
import { KEYS } from "@/config/controls";
import { KEY_SCROLL_STEP } from "@/config/scroll";

/** Global keyboard map: F free-roam, M mute, ` editor, arrows/space/page keys
 *  drive the narrative scroll (accessibility path — no wheel required). */
export function useKeyBindings(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const app = useAppStore.getState();
      switch (e.code) {
        case KEYS.freeRoam:
          if (app.started) app.requestModeToggle();
          break;
        case KEYS.mute:
          if (app.started) app.toggleAudio();
          break;
        case KEYS.editor:
          e.preventDefault();
          app.toggleEditor();
          break;
        case "ArrowDown":
        case "PageDown":
          if (app.mode === "scroll" && app.started) {
            e.preventDefault();
            scrollByViewport(KEY_SCROLL_STEP);
          }
          break;
        case "Space":
          if (app.mode === "scroll" && app.started) {
            e.preventDefault();
            scrollByViewport(e.shiftKey ? -KEY_SCROLL_STEP : KEY_SCROLL_STEP);
          }
          break;
        case "ArrowUp":
        case "PageUp":
          if (app.mode === "scroll" && app.started) {
            e.preventDefault();
            scrollByViewport(-KEY_SCROLL_STEP);
          }
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
