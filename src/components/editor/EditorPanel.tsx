"use client";

import { useEffect } from "react";
import { Leva } from "leva";
import { useEditorBindings } from "./bindings";

/** Real-time scene editor (toggle: ` ). Every tweak is live — no reload —
 *  and persists to localStorage. While the scroll timeline is actively
 *  scrubbing it re-writes act uniforms; pause scrolling or enter free-roam to
 *  sculpt undisturbed. Persisted camera points survive reloads. */
export function EditorPanel() {
  useEditorBindings();

  // leva and pointer-lock don't mix — release the FPS lock while editing.
  useEffect(() => {
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  return (
    <Leva
      titleBar={{ title: "Éclosion - éditeur", filter: false }}
      theme={{ sizes: { rootWidth: "300px" } }}
    />
  );
}
