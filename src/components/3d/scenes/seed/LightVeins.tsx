"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mulberry32 } from "@/utils/random";
import { groundHeight } from "@/utils/terrain";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

const VEIN_COUNT = 7;
const SAMPLES = 26;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uGrow;
uniform float uGlow;
varying vec2 vUv;

void main() {
  float u = vUv.x;
  // Alive only behind the growth front, with a hot tip AT the front.
  float present = smoothstep(uGrow, uGrow - 0.08, u);
  float head = exp(-pow((u - uGrow) * 16.0, 2.0));
  // Sap flowing outward from the seed.
  float flow = 0.55 + 0.45 * sin((u * 14.0 - uTime * 0.9) * 3.1415);
  // The world's heartbeat: the double thump every 1.5s.
  float tt = mod(uTime, 1.5);
  float hb = exp(-pow((tt - 0.18) * 9.0, 2.0)) + 0.6 * exp(-pow((tt - 0.51) * 9.0, 2.0));
  float edge = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
  float taper = 1.0 - u * 0.55;
  float a = (present * flow * (0.34 + 0.45 * hb) + head * 0.9) * edge * taper * uGlow;
  a = min(a, 0.7);
  vec3 col = mix(vec3(1.0, 0.6, 0.24), vec3(1.0, 0.86, 0.55), clamp(hb * 0.4 + head, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}
`;

/** Veins of light crawling OUT of the mound across the soil — the copy made
 *  the promise ("des racines cherchent l'eau"); this keeps it, luminous and
 *  pulsing on the seed's heartbeat. Grows with the existing rootsGrowth. */
export function LightVeins() {
  const baseY = useMemo(() => groundHeight(0, 0), []);
  const geometry = useMemo(() => {
    const rng = mulberry32(4177);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let v = 0; v < VEIN_COUNT; v++) {
      const angle = (v / VEIN_COUNT) * Math.PI * 2 + rng() * 0.7;
      const length = 7 + rng() * 4.5;
      const meander = 0.5 + rng() * 0.6;
      const base = (positions.length / 3) | 0;
      // Born just OUTSIDE the stone ring — under the mound they'd be buried.
      let theta = angle;
      let x = Math.cos(angle) * 3.3;
      let z = Math.sin(angle) * 3.3;
      for (let i = 0; i < SAMPLES; i++) {
        const t = i / (SAMPLES - 1);
        theta += Math.sin(t * 9 + v * 2.3) * meander * 0.16;
        const step = length / (SAMPLES - 1);
        x += Math.cos(theta) * step;
        z += Math.sin(theta) * step;
        const width = (0.19 - t * 0.12) * (0.8 + rng() * 0.2);
        const px = -Math.sin(theta) * width;
        const pz = Math.cos(theta) * width;
        const y = groundHeight(x, z) - baseY + 0.07;
        positions.push(x - px, y, z - pz, x + px, y, z + pz);
        uvs.push(t, 0, t, 1);
        if (i > 0) {
          const p = base + i * 2;
          indices.push(p - 2, p - 1, p, p - 1, p + 1, p);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, [baseY]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uGrow: { value: 0 }, uGlow: { value: 0 } },
      }),
    [],
  );
  useDisposable(geometry, material);

  useFrame(({ clock }) => {
    const u = material.uniforms;
    if (u.uTime) u.uTime.value = clock.elapsedTime;
    if (u.uGrow) u.uGrow.value = uniformProxies.acts.rootsGrowth;
    if (u.uGlow) u.uGlow.value = uniformProxies.acts.seedGlow;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
