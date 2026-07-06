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
import { GrainEffect } from "./GrainEffect";
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
  const speedBlur = useMemo(() => new SpeedBlurEffect(), []);
  const grade = useMemo(() => new ColorGradeEffect(), []);
  const ripple = useMemo(() => new ActTransitionEffect(), []);
  const dofRef = useRef<DepthOfFieldEffect>(null);

  useFrame(() => {
    const g = uniformProxies.grade;
    grade.setGrade(g.temperature, g.saturation, g.lift, g.underwater);
    ripple.setRipple(uniformProxies.transition.ripple);
    const velocity = useProgressStore.getState().velocity;
    speedBlur.setStrength(flags.speedBlur ? clamp01(Math.abs(velocity) / 6000) : 0);
    // Rack focus: the timeline pulls the focal plane per act (close-up on the
    // seed, far vista at dawn) — written straight to the CoC material.
    const dof = dofRef.current;
    if (dof) {
      const focusUniform = dof.cocMaterial.uniforms["focusDistance"];
      if (focusUniform) focusUniform.value = uniformProxies.camera.focus;
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
  effects.push(<primitive key="grade" object={grade} />);
  if (flags.grain) effects.push(<primitive key="grain" object={grain} />);
  if (flags.speedBlur) effects.push(<primitive key="blur" object={speedBlur} />);
  effects.push(<Vignette key="vignette" offset={VIGNETTE_SETTINGS.offset} darkness={VIGNETTE_SETTINGS.darkness} />);
  if (flags.antialias !== "none") effects.push(<SMAA key="aa" />);

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
