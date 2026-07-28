"use client";

import { useMemo, useRef, type ReactElement } from "react";
import * as THREE from "three";
import type { DepthOfFieldEffect } from "postprocessing";
import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  GodRays,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { QUALITY_PRESETS } from "@/config/quality";
import { useQualityStore } from "@/stores/qualityStore";
import { useAppStore } from "@/stores/appStore";
import { useProgressStore } from "@/stores/progressStore";
import { uniformProxies } from "@/timelines/uniformProxies";
import { clamp01 } from "@/utils/math";
import { groundHeight } from "@/utils/terrain";
import { FXAAEffect } from "./FXAAEffect";
import { GrainEffect } from "./GrainEffect";
import { LensRainEffect } from "./LensRainEffect";
import { SpeedBlurEffect } from "./SpeedBlurEffect";
import { ColorGradeEffect } from "./ColorGradeEffect";
import { ActTransitionEffect } from "./ActTransitionEffect";
import { useLightSourceStore } from "./lightSourceStore";
import {
  BLOOM_SETTINGS,
  CHROMATIC_OFFSET,
  DOF_SETTINGS,
  GOD_RAYS_SETTINGS,
  VIGNETTE_SETTINGS,
} from "./effectChain";

/** Composer assembled from the tier's flags. The `key` forces a clean rebuild
 *  on tier change, context restore, or god-ray source change — never per
 *  frame. Per-frame effect values are plain uniform writes. */
export function PostProcessing() {
  const tier = useQualityStore((s) => s.tier);
  const restoreNonce = useAppStore((s) => s.restoreNonce);
  const godRaySource = useLightSourceStore((s) => s.godRaySource);
  const flags = QUALITY_PRESETS[tier].post;

  const grain = useMemo(() => new GrainEffect(), []);
  const fxaa = useMemo(() => new FXAAEffect(), []);
  const lensRain = useMemo(() => new LensRainEffect(), []);
  const speedBlur = useMemo(() => new SpeedBlurEffect(), []);
  const grade = useMemo(() => new ColorGradeEffect(), []);
  const ripple = useMemo(() => new ActTransitionEffect(), []);
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const viewDir = useMemo(() => new THREE.Vector3(), []);
  const freeFocus = useRef(0.02);

  useFrame((state, delta) => {
    const g = uniformProxies.grade;
    grade.setGrade(g.temperature, g.saturation, g.lift, g.underwater);
    ripple.setRipple(uniformProxies.transition.ripple);
    const velocity = useProgressStore.getState().velocity;
    speedBlur.setStrength(flags.speedBlur ? clamp01(Math.abs(velocity) / 6000) : 0);
    // Grain scales with scene light: near-invisible in the dark acts (where
    // noise reads as banding), full texture in the bright ones.
    grain.setAmount(0.016 + clamp01(uniformProxies.ambient.intensity / 0.45) * 0.026);
    // Storm rain hits the LENS itself — droplets refract, drips run.
    lensRain.setAmount(uniformProxies.acts.rainIntensity);
    // Rack focus: the timeline pulls the focal plane per act (close-up on the
    // seed, far vista at dawn) — written straight to the CoC material. In
    // free-roam the story's plan is meaningless: focus on what the walker is
    // LOOKING AT, via a cheap analytic march against the terrain.
    const dof = dofRef.current;
    if (dof) {
      let focus = uniformProxies.camera.focus;
      if (useAppStore.getState().mode === "free") {
        const camera = state.camera;
        camera.getWorldDirection(viewDir);
        let d = 4;
        let hit = 220;
        for (let i = 0; i < 12; i++) {
          const y = camera.position.y + viewDir.y * d;
          if (y <= groundHeight(camera.position.x + viewDir.x * d, camera.position.z + viewDir.z * d) + 0.3) {
            hit = d;
            break;
          }
          d *= 1.45;
          if (d > 220) break;
        }
        const target = Math.min(0.15, Math.max(0.005, hit / 1500));
        freeFocus.current += (target - freeFocus.current) * (1 - Math.exp(-4 * Math.min(delta, 0.05)));
        focus = freeFocus.current;
      } else {
        freeFocus.current = focus;
      }
      const focusUniform = dof.cocMaterial.uniforms["focusDistance"];
      if (focusUniform) focusUniform.value = focus;
    }
  });

  const effects: ReactElement[] = [];
  effects.push(
    <Bloom
      key="bloom"
      intensity={BLOOM_SETTINGS.intensity}
      luminanceThreshold={BLOOM_SETTINGS.luminanceThreshold}
      luminanceSmoothing={BLOOM_SETTINGS.luminanceSmoothing}
      mipmapBlur
    />,
  );
  if (flags.dof) {
    effects.push(
      <DepthOfField
        key="dof"
        ref={dofRef}
        focusDistance={DOF_SETTINGS.focusDistance}
        focalLength={DOF_SETTINGS.focalLength}
        bokehScale={DOF_SETTINGS.bokehScale}
      />,
    );
  }
  if (flags.godRays && godRaySource) {
    effects.push(<GodRays key="godrays" sun={godRaySource} {...GOD_RAYS_SETTINGS} />);
  }
  if (flags.chromatic) {
    effects.push(<ChromaticAberration key="ca" offset={CHROMATIC_OFFSET} />);
  }
  effects.push(<primitive key="ripple" object={ripple} />);
  effects.push(<primitive key="lensrain" object={lensRain} />);
  effects.push(<primitive key="grade" object={grade} />);
  if (flags.grain) effects.push(<primitive key="grain" object={grain} />);
  if (flags.speedBlur) effects.push(<primitive key="blur" object={speedBlur} />);
  effects.push(<Vignette key="vignette" offset={VIGNETTE_SETTINGS.offset} darkness={VIGNETTE_SETTINGS.darkness} />);
  // Honour the tier's choice: "fxaa" used to fall through to SMAA, so every
  // phone paid the expensive path its own preset had ruled out.
  if (flags.antialias === "smaa") effects.push(<SMAA key="aa" />);
  else if (flags.antialias === "fxaa") effects.push(<primitive key="aa" object={fxaa} />);

  return (
    <EffectComposer
      key={`${tier}-${restoreNonce}-${godRaySource?.uuid ?? "no-sun"}`}
      multisampling={0}
      frameBufferType={THREE.HalfFloatType}
    >
      {effects}
    </EffectComposer>
  );
}
