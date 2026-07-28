"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { createSkyMaterial } from "@/components/3d/materials/SkyMaterial";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { uniformProxies } from "@/timelines/uniformProxies";
import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { useDisposable } from "@/hooks/useDisposable";
import { groundHeight } from "@/utils/terrain";
import { useAppStore } from "@/stores/appStore";
import { computeCycleLook, cycleState, CYCLE_PERIOD_SEC } from "@/lib/dayCycle";
import { WATER_LEVEL } from "@/config/world";

/** Owns everything persistent: the sky dome + star field (camera-following),
 *  scene fog, the sun/ambient lights, and the once-per-frame refresh of the
 *  shared uniforms every custom material references. */
export function GlobalEnvironment() {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const skyMaterial = useMemo(() => createSkyMaterial(), []);
  const skyGeometry = useMemo(() => new THREE.SphereGeometry(700, 32, 16), []);
  useDisposable(skyGeometry, skyMaterial);

  const fog = useMemo(() => new THREE.FogExp2(0x05070a, 0.02), []);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  const domeRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunDir = useMemo(() => new THREE.Vector3(), []);
  // Free-roam day cycle: blend eases in/out so entering and leaving
  // exploration never pops the light; phase only advances while exploring.
  const cycle = useRef({ phase: 0.04, blend: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = uniformProxies;
    const u = sharedUniforms;

    u.uTime.value += dt;
    u.uWind.value.set(p.wind.x, p.wind.y, p.wind.z);
    u.uDpr.value = gl.getPixelRatio();
    u.uFlash.value *= Math.exp(-6 * dt);

    u.uFogColor.value.setRGB(p.fog.color.r, p.fog.color.g, p.fog.color.b);
    u.uFogDensity.value = p.fog.density;
    u.uSkyTop.value.setRGB(p.sky.topColor.r, p.sky.topColor.g, p.sky.topColor.b);
    u.uSkyBottom.value.setRGB(p.sky.bottomColor.r, p.sky.bottomColor.g, p.sky.bottomColor.b);

    let el = p.sky.sunElevation;
    let az = p.sky.sunAzimuth;
    u.uSunColor.value.setRGB(p.sun.color.r, p.sun.color.g, p.sun.color.b);
    u.uSunIntensity.value = p.sun.intensity;
    u.uAmbientColor.value.setRGB(p.ambient.color.r, p.ambient.color.g, p.ambient.color.b);
    u.uAmbientIntensity.value = p.ambient.intensity;

    // While exploring, time flows again: a full day in five minutes, poured
    // OVER the act's frozen palette (applied last so nothing re-overwrites
    // it) and poured back out seamlessly on return to the story.
    const c = cycle.current;
    const exploring = useAppStore.getState().mode === "free";
    c.blend += ((exploring ? 1 : 0) - c.blend) * (1 - Math.exp(-0.5 * dt));
    if (exploring) c.phase = (c.phase + dt / CYCLE_PERIOD_SEC) % 1;
    cycleState.blend = c.blend;
    if (c.blend > 0.003) {
      const look = computeCycleLook(c.phase);
      const b = c.blend;
      cycleState.daylight = look.daylight;
      u.uFogColor.value.lerp(new THREE.Color(...look.fog), b);
      u.uSkyTop.value.lerp(new THREE.Color(...look.skyTop), b);
      u.uSkyBottom.value.lerp(new THREE.Color(...look.skyBottom), b);
      el += (look.sunElevation - el) * b;
      az += (look.sunAzimuth - az) * b;
      u.uSunColor.value.lerp(new THREE.Color(...look.sun), b);
      u.uAmbientColor.value.lerp(new THREE.Color(...look.ambient), b);
      u.uSunIntensity.value += (look.sunIntensity - u.uSunIntensity.value) * b;
      u.uAmbientIntensity.value += (look.ambientIntensity - u.uAmbientIntensity.value) * b;
    }
    sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    u.uSunDir.value.copy(sunDir);

    const aurora = skyMaterial.uniforms.uAurora;
    if (aurora) aurora.value = p.sky.auroraIntensity;
    // The dive drives grade.underwater — the dome follows it into the water,
    // scaled by how DEEP the camera actually is: in the last meters of the
    // ascent the sky bleeds back overhead, the growing light that announces
    // the exit (locking the dome to the grade alone kept the screen blue
    // until the ripple, and the emergence felt late).
    const underwater = skyMaterial.uniforms.uUnderwater;
    if (underwater) {
      const depth = WATER_LEVEL - state.camera.position.y;
      const submerged = THREE.MathUtils.smoothstep(depth, 0.5, 7.0);
      underwater.value = p.grade.underwater * submerged;
    }

    fog.color.copy(u.uFogColor.value);
    fog.density = p.fog.density;

    if (sunRef.current) {
      sunRef.current.position.copy(sunDir).multiplyScalar(220).add(state.camera.position);
      sunRef.current.target.position.copy(state.camera.position);
      sunRef.current.target.updateMatrixWorld();
      sunRef.current.intensity = u.uSunIntensity.value * 2.2;
      sunRef.current.color.copy(u.uSunColor.value);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = u.uAmbientIntensity.value * 2.4;
      ambientRef.current.color.copy(u.uAmbientColor.value);
    }
    domeRef.current?.position.copy(state.camera.position);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __eclosionDebug?: object }).__eclosionDebug = {
        camera: state.camera.position.toArray().map((v) => Math.round(v * 10) / 10),
        fov: (state.camera as THREE.PerspectiveCamera).fov,
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        dpr: gl.getPixelRatio(),
        clearance:
          Math.round(
            (state.camera.position.y - groundHeight(state.camera.position.x, state.camera.position.z)) * 10,
          ) / 10,
      };
    }
  });

  return (
    <>
      <group ref={domeRef}>
        <mesh geometry={skyGeometry} material={skyMaterial} frustumCulled={false} renderOrder={-10} />
        <GPUParticles
          preset={PARTICLE_PRESETS.stars}
          // Daylight drowns the stars while the free-roam day cycle runs.
          getIntensity={() =>
            uniformProxies.sky.starIntensity * (1 - cycleState.daylight * cycleState.blend * 0.92)
          }
        />
      </group>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <directionalLight ref={sunRef} intensity={0.1} />
    </>
  );
}
