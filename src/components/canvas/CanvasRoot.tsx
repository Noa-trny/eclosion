"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useQualityStore } from "@/stores/qualityStore";
import { attachContextLossHandlers } from "@/lib/webgl/contextLoss";
import { SceneManager } from "./SceneManager";
import { WarmupGate } from "./WarmupGate";
import { CameraRig } from "./CameraRig";
import { FreeRoamController } from "./FreeRoamController";
import { GlobalEnvironment } from "./GlobalEnvironment";
import { WorldGround } from "./WorldGround";
import { WeatherSystem } from "./WeatherSystem";
import { QualityManager } from "./QualityManager";
import { AudioListenerSync } from "./AudioListenerSync";
import { CursorWake } from "./CursorWake";
import { ActTitles } from "@/components/3d/ActTitles";
import { Celestial } from "@/components/3d/Celestial";
import { PostProcessing } from "@/effects/PostProcessing";

function ContextLossBridge() {
  const gl = useThree((s) => s.gl);
  useEffect(() => attachContextLossHandlers(gl.domElement), [gl]);
  return null;
}

/** The fixed fullscreen canvas. Loaded with ssr:false from Experience — this
 *  module (and everything under it) never runs on the server. */
export function CanvasRoot() {
  const dpr = useQualityStore((s) => s.dpr);
  return (
    <div className="fixed inset-0" aria-hidden>
      <Canvas
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          powerPreference: "high-performance",
          // Photo mode (P) reads the canvas back after the frame renders.
          preserveDrawingBuffer: true,
        }}
        camera={{ fov: 55, near: 0.1, far: 1500, position: [0, 9, 66] }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x020308), 1);
          // three's default diagnostics fetch shader/program info logs on
          // each program's first use — synchronous driver round-trips that
          // profiling shows INSIDE the act-boundary hitches (acts compile at
          // first draw, mid-scroll). The logs only ever say anything while
          // authoring shaders, so keep them in dev, drop them in production.
          gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
          // phase flips to "ready" once WarmupGate has compiled the shaders.
        }}
      >
        <ContextLossBridge />
        <WarmupGate />
        <QualityManager />
        <GlobalEnvironment />
        <WorldGround />
        <Celestial />
        <WeatherSystem />
        <SceneManager />
        <ActTitles />
        <CameraRig />
        <FreeRoamController />
        <CursorWake />
        <AudioListenerSync />
        <PostProcessing />
      </Canvas>
    </div>
  );
}
