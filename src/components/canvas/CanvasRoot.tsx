"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useAppStore } from "@/stores/appStore";
import { useQualityStore } from "@/stores/qualityStore";
import { attachContextLossHandlers } from "@/lib/webgl/contextLoss";
import { SceneManager } from "./SceneManager";
import { CameraRig } from "./CameraRig";
import { FreeRoamController } from "./FreeRoamController";
import { GlobalEnvironment } from "./GlobalEnvironment";
import { WorldGround } from "./WorldGround";
import { WeatherSystem } from "./WeatherSystem";
import { QualityManager } from "./QualityManager";
import { AudioListenerSync } from "./AudioListenerSync";
import { CursorWake } from "./CursorWake";
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
        }}
        camera={{ fov: 55, near: 0.1, far: 1500, position: [0, 9, 66] }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x020308), 1);
          useAppStore.getState().setPhase("ready");
        }}
      >
        <ContextLossBridge />
        <QualityManager />
        <GlobalEnvironment />
        <WorldGround />
        <WeatherSystem />
        <SceneManager />
        <CameraRig />
        <FreeRoamController />
        <CursorWake />
        <AudioListenerSync />
        <PostProcessing />
      </Canvas>
    </div>
  );
}
