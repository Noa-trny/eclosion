"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useKeyBindings } from "@/hooks/useKeyBindings";
import { useAudioBridge } from "@/hooks/useAudioEngine";
import { useAppStore } from "@/stores/appStore";
import { DomRoot } from "./dom/DomRoot";
import { Overlay } from "./dom/Overlay";
import { EndCard } from "./dom/EndCard";
import { Hud } from "./dom/Hud";
import { ProgressLine } from "./dom/ProgressLine";
import { Cursor } from "./dom/Cursor";
import { LangToggle } from "./dom/LangToggle";
import { initLang } from "@/stores/langStore";
import { ScrollHint } from "./dom/ScrollHint";
import { FreeRoamHint } from "./dom/FreeRoamHint";
import { StartScreen } from "./dom/StartScreen";
import { A11yAnnouncer } from "./dom/A11yAnnouncer";
import { ContextLossOverlay } from "./dom/ContextLossOverlay";

/** Client boundary. Canvas (and thus all of three) is ssr:false — Next 15
 *  only allows that from inside a client component, which this is. */
const CanvasRoot = dynamic(
  () => import("./canvas/CanvasRoot").then((m) => m.CanvasRoot),
  { ssr: false },
);
const EditorPanel = dynamic(
  () => import("./editor/EditorPanel").then((m) => m.EditorPanel),
  { ssr: false },
);

export function Experience() {
  const supported = useWebGLSupport();
  const reduced = useReducedMotion();
  const router = useRouter();
  const editorOpen = useAppStore((s) => s.editorOpen);

  useEffect(() => {
    if (supported === false) router.replace("/fallback");
  }, [supported, router]);

  useEffect(() => {
    useAppStore.setState({ reducedMotion: reduced });
  }, [reduced]);

  useEffect(() => {
    initLang();
  }, []);

  useLenisScroll(!reduced);
  useKeyBindings();
  useAudioBridge();

  if (supported === false) return null;

  return (
    <>
      {supported === true && <CanvasRoot />}
      <DomRoot />
      <Overlay />
      <EndCard />
      <Hud />
      <ProgressLine />
      <Cursor />
      <LangToggle />
      <ScrollHint />
      <FreeRoamHint />
      <StartScreen />
      <A11yAnnouncer />
      <ContextLossOverlay />
      {editorOpen && <EditorPanel />}
    </>
  );
}
