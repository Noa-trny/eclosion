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

    const el = p.sky.sunElevation;
    const az = p.sky.sunAzimuth;
    sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    u.uSunDir.value.copy(sunDir);
    u.uSunColor.value.setRGB(p.sun.color.r, p.sun.color.g, p.sun.color.b);
    u.uSunIntensity.value = p.sun.intensity;
    u.uAmbientColor.value.setRGB(p.ambient.color.r, p.ambient.color.g, p.ambient.color.b);
    u.uAmbientIntensity.value = p.ambient.intensity;

    const aurora = skyMaterial.uniforms.uAurora;
    if (aurora) aurora.value = p.sky.auroraIntensity;

    fog.color.copy(u.uFogColor.value);
    fog.density = p.fog.density;

    if (sunRef.current) {
      sunRef.current.position.copy(sunDir).multiplyScalar(220).add(state.camera.position);
      sunRef.current.target.position.copy(state.camera.position);
      sunRef.current.target.updateMatrixWorld();
      sunRef.current.intensity = p.sun.intensity * 2.2;
      sunRef.current.color.copy(u.uSunColor.value);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = p.ambient.intensity * 2.4;
      ambientRef.current.color.copy(u.uAmbientColor.value);
    }
    domeRef.current?.position.copy(state.camera.position);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __eclosionDebug?: object }).__eclosionDebug = {
        camera: state.camera.position.toArray().map((v) => Math.round(v * 10) / 10),
        fov: (state.camera as THREE.PerspectiveCamera).fov,
      };
    }
  });

  return (
    <>
      <group ref={domeRef}>
        <mesh geometry={skyGeometry} material={skyMaterial} frustumCulled={false} renderOrder={-10} />
        <GPUParticles
          preset={PARTICLE_PRESETS.stars}
          getIntensity={() => uniformProxies.sky.starIntensity}
        />
      </group>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <directionalLight ref={sunRef} intensity={0.1} />
    </>
  );
}
