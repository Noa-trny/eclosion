import * as THREE from "three";

/** Global uniform objects shared BY REFERENCE across every material and
 *  particle system — updated once per frame by GlobalEnvironment, never per
 *  system. uFlash is pulsed by the storm's lightning controller. */
export const sharedUniforms = {
  uTime: { value: 0 },
  uWind: { value: new THREE.Vector3(0.4, 0, 0.15) },
  uFlash: { value: 0 },
  uDpr: { value: 1 },
  // Atmosphere mirrors of uniformProxies, refreshed once per frame — custom
  // shaders share these instead of each material re-reading the proxies.
  uFogColor: { value: new THREE.Color(0.012, 0.016, 0.028) },
  uFogDensity: { value: 0.02 },
  uSunDir: { value: new THREE.Vector3(0.3, 0.4, 0.85) },
  uSunColor: { value: new THREE.Color(0.4, 0.5, 0.8) },
  uSunIntensity: { value: 0.05 },
  uAmbientColor: { value: new THREE.Color(0.25, 0.3, 0.5) },
  uAmbientIntensity: { value: 0.06 },
  uSkyTop: { value: new THREE.Color(0.004, 0.006, 0.012) },
  uSkyBottom: { value: new THREE.Color(0.01, 0.012, 0.022) },
};
