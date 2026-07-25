"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ACTS } from "@/config/acts";
import { ACT_COPY } from "@/config/i18n";
import { useLangStore } from "@/stores/langStore";
import { useAppStore } from "@/stores/appStore";
import { useProgressStore } from "@/stores/progressStore";
import { createTitleTexture, loadTitleFont } from "@/lib/textTexture";
import { clamp01 } from "@/utils/math";

interface TitleAnchor {
  /** World position of the title's center. */
  pos: [number, number, number];
  /** Portrait screens see a much narrower horizontal field — laterally
   *  offset anchors need a re-centered variant or they get cut off. */
  portraitPos?: [number, number, number];
  /** Point the plane faces — the act's opening camera position. */
  face: [number, number, number];
  /** World width of the plane (height follows the texture aspect). */
  width: number;
  /** Act-local progress window: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]. */
  window: [number, number, number, number];
  /** Portrait override: the narrow frame drifts off a world-anchored title
   *  much sooner — close the window before the composition breaks. */
  portraitWindow?: [number, number, number, number];
}

/** Hand-placed: each title hangs in the act's opening sightline, far enough
 *  to sit IN the world (fog, DOF, parallax), near enough to read. */
const ANCHORS: TitleAnchor[] = [
  // Negative fade-in start: fully present at rest (p=0), right after entry.
  { pos: [0, 10, 30], portraitPos: [0, 11.5, 30], face: [0, 9, 66], width: 17, window: [-0.02, 0, 0.55, 0.75] },
  { pos: [-2.4, 4.8, 6.5], portraitPos: [0.4, 5.4, 7], face: [1.5, 4.5, 26], width: 6, window: [0.05, 0.16, 0.42, 0.6], portraitWindow: [0.05, 0.14, 0.26, 0.38] },
  { pos: [-6.5, 7, -36], face: [-4, 3.6, -6], width: 9, window: [0.05, 0.16, 0.42, 0.6] },
  { pos: [27.5, 29.5, -56.5], face: [12.4, 28, -71.3], width: 13, window: [0.05, 0.16, 0.45, 0.62] },
  { pos: [121, 5, 5], face: [99, 14.6, -3.5], width: 13.5, window: [0.03, 0.1, 0.17, 0.26] },
  { pos: [255, 33, -35], face: [237, 16.6, -24], width: 13, window: [0.04, 0.12, 0.22, 0.32] },
  { pos: [368, 9.5, 36], face: [345, 14, 17], width: 11, window: [0.05, 0.14, 0.32, 0.45] },
  { pos: [432, 21.5, 60], face: [396, 11, 54], width: 16, window: [0.05, 0.16, 0.4, 0.55] },
];

/** The act titles as objects IN the world: they catch fog, depth of field and
 *  parallax like everything else. The DOM keeps an sr-only copy. */
export function ActTitles() {
  const lang = useLangStore((s) => s.lang);
  const [fontReady, setFontReady] = useState(0);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const fadeRef = useRef<number[]>(ACTS.map(() => 0));
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  useEffect(() => {
    let alive = true;
    void loadTitleFont().then(() => {
      if (alive) setFontReady((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, []);

  const entries = useMemo(() => {
    // fontReady re-runs this once Fraunces is available for canvas rasterizing.
    void fontReady;
    return ACTS.map((act, i) => {
      const anchor = ANCHORS[i];
      const title = createTitleTexture(ACT_COPY[lang][act.id].title);
      if (!anchor || !title) return null;
      // No fog and no depth test: heavy acts (storm, volcano) would otherwise
      // wash the white into grey or bury the plane inside terrain. The text
      // still integrates through opacity, DOF and parallax.
      const material = new THREE.MeshBasicMaterial({
        map: title.texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        fog: false,
        opacity: 0,
        toneMapped: false,
      });
      return { anchor, material, aspect: title.aspect, act };
    });
  }, [lang, fontReady]);

  useEffect(() => {
    return () => {
      for (const entry of entries) {
        if (!entry) continue;
        entry.material.map?.dispose();
        entry.material.dispose();
      }
    };
  }, [entries]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const progress = useProgressStore.getState().progress;
    const app = useAppStore.getState();
    // Hidden until entry — the start screen's veil is translucent and the
    // void title would ghost through it.
    const inScroll = app.mode === "scroll" && app.started ? 1 : 0;
    const screenAspect = state.size.width / state.size.height;
    const portrait = screenAspect < 0.9;
    // Narrow screens: shrink the plane so the words stay inside the frame.
    const widthScale = Math.min(1, Math.max(0.55, screenAspect / 1.5));
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const mesh = meshRefs.current[i];
      if (mesh) {
        const p = portrait && entry.anchor.portraitPos ? entry.anchor.portraitPos : entry.anchor.pos;
        mesh.position.set(p[0], p[1], p[2]);
        const w = entry.anchor.width * widthScale;
        mesh.scale.set(w, w / entry.aspect, 1);
        mesh.lookAt(entry.anchor.face[0], entry.anchor.face[1], entry.anchor.face[2]);
        // Faded-out planes still rasterize (transparent + no culling) — eight
        // near-fullscreen quads of pure fill-rate. Only draw the living one.
        mesh.visible = (fadeRef.current[i] ?? 0) > 0.01;
      }
      const { start, end } = entry.act.range;
      const local = clamp01((progress - start) / (end - start));
      const [i0, i1, o0, o1] =
        portrait && entry.anchor.portraitWindow ? entry.anchor.portraitWindow : entry.anchor.window;
      const target =
        clamp01((local - i0) / Math.max(0.001, i1 - i0)) *
        (1 - clamp01((local - o0) / Math.max(0.001, o1 - o0))) *
        inScroll;
      // Damped, so mode toggles and scroll jumps never pop the text.
      const fade = fadeRef.current[i] ?? 0;
      const next = fade + (target - fade) * Math.min(1, delta * 6);
      fadeRef.current[i] = next;
      entry.material.opacity = next * 0.92;
    }
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __titleDebug?: object }).__titleDebug = {
        progress,
        fades: fadeRef.current.map((f) => Math.round(f * 100) / 100),
      };
    }
  });

  return (
    <group>
      {entries.map((entry, i) =>
        entry ? (
          <mesh
            key={`${entry.act.id}-${lang}-${fontReady}`}
            geometry={geometry}
            material={entry.material}
            position={entry.anchor.pos}
            renderOrder={40 + i}
            frustumCulled={false}
            ref={(mesh) => {
              meshRefs.current[i] = mesh;
            }}
          />
        ) : null,
      )}
    </group>
  );
}
