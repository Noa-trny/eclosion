"use client";

import { useEffect, useMemo } from "react";
import { button, useControls } from "leva";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useQualityStore } from "@/stores/qualityStore";
import { useWeatherStore } from "@/stores/weatherStore";
import {
  exportCameraPoints,
  getCameraPoint,
  getCameraPointCount,
  refreshCurves,
  updateCameraPoint,
} from "@/timelines/cameraPath";
import type { Tier } from "@/types/quality";
import { clearPersisted, loadPersisted, saveCameraPoint, saveOverride } from "./persistence";

function num(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

/** The leva ↔ world seam. Every control writes straight into the same targets
 *  the timeline/sim use (proxies, stores, camera curve) and persists to
 *  localStorage. This module is the ONLY leva-aware code besides the panel —
 *  swapping leva out means rewriting just these hooks. */
export function useEditorBindings(): void {
  const saved = useMemo(() => loadPersisted(), []);

  useControls("Atmosphère", {
    fogDensity: {
      value: num(saved.overrides.fogDensity, uniformProxies.fog.density),
      min: 0,
      max: 0.09,
      step: 0.001,
      onChange: (v: number) => {
        uniformProxies.fog.density = v;
        saveOverride("fogDensity", v);
      },
    },
    temperature: {
      value: num(saved.overrides.temperature, uniformProxies.grade.temperature),
      min: -1,
      max: 1,
      onChange: (v: number) => {
        uniformProxies.grade.temperature = v;
        saveOverride("temperature", v);
      },
    },
    saturation: {
      value: num(saved.overrides.saturation, uniformProxies.grade.saturation),
      min: 0,
      max: 2,
      onChange: (v: number) => {
        uniformProxies.grade.saturation = v;
        saveOverride("saturation", v);
      },
    },
  });

  useControls("Actes (uniforms)", {
    seedGlow: actControl("seedGlow"),
    germination: actControl("germination"),
    treeGrowth: actControl("treeGrowth"),
    fireflyIntensity: actControl("fireflyIntensity"),
    rainIntensity: actControl("rainIntensity"),
    cloudDensity: actControl("cloudDensity"),
    lavaFlow: actControl("lavaFlow"),
    smokeDensity: actControl("smokeDensity"),
    bloomMorph: actControl("bloomMorph"),
    birdActivity: actControl("birdActivity"),
    sunriseProgress: actControl("sunriseProgress"),
  });

  useControls("Météo & heure", {
    timeOfDay: {
      value: useWeatherStore.getState().timeOfDay,
      min: 0,
      max: 1,
      onChange: (v: number) => useWeatherStore.getState().setTimeOfDay(v),
    },
  });

  const setTier = useQualityStore((s) => s.setTier);
  const setScale = useQualityStore((s) => s.setEditorParticleScale);
  useControls("Qualité", {
    tier: {
      value: useQualityStore.getState().tier,
      options: ["low", "medium", "high"],
      onChange: (v: Tier) => setTier(v),
    },
    particleScale: {
      value: num(saved.overrides.particleScale, 1),
      min: 0,
      max: 2,
      onChange: (v: number) => {
        setScale(v);
        saveOverride("particleScale", v);
      },
    },
  });

  const [cameraValues, setCamera] = useControls("Caméra", () => ({
    fovOffset: {
      value: num(saved.overrides.fovOffset, 0),
      min: -25,
      max: 25,
      onChange: (v: number) => {
        uniformProxies.camera.fovOffset = v;
        saveOverride("fovOffset", v);
      },
    },
    pointIndex: { value: 0, min: 0, max: getCameraPointCount() - 1, step: 1 },
    px: { value: getCameraPoint(0)[0], step: 0.5 },
    py: { value: getCameraPoint(0)[1], step: 0.5 },
    pz: { value: getCameraPoint(0)[2], step: 0.5 },
    copierLesPoints: button(() => {
      const json = JSON.stringify(exportCameraPoints());
      void navigator.clipboard?.writeText(json);
      console.info("[éclosion] camera points:", json);
    }),
    réinitialiser: button(() => {
      clearPersisted();
      window.location.reload();
    }),
  }));

  const index = Math.round(cameraValues.pointIndex);
  useEffect(() => {
    const p = getCameraPoint(index);
    setCamera({ px: p[0], py: p[1], pz: p[2] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    updateCameraPoint(index, [cameraValues.px, cameraValues.py, cameraValues.pz]);
    refreshCurves();
    saveCameraPoint(index, [cameraValues.px, cameraValues.py, cameraValues.pz]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraValues.px, cameraValues.py, cameraValues.pz]);
}

function actControl(key: keyof typeof uniformProxies.acts) {
  return {
    value: uniformProxies.acts[key],
    min: 0,
    max: 1,
    onChange: (v: number) => {
      uniformProxies.acts[key] = v;
    },
  };
}
