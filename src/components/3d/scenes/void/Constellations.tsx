"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useProgressStore } from "@/stores/progressStore";
import { uniformProxies } from "@/timelines/uniformProxies";
import { sharedUniforms } from "@/components/3d/materials/sharedUniforms";
import { useDisposable } from "@/hooks/useDisposable";
import { clamp01, remap } from "@/utils/math";

/** The promise of the world, written in the sky: three constellations — the
 *  Seed, the Whale, the Bird — draw themselves line by line as the visitor
 *  scrolls through the void, foreshadowing the acts to come. */
interface ConstellationDef {
  offset: [number, number, number];
  scale: number;
  /** 2D polyline, hand-drawn; z comes from the offset plane. */
  points: Array<[number, number]>;
  /** Progress window over which this figure draws itself. */
  window: [number, number];
}

const FIGURES: ConstellationDef[] = [
  // The Seed — a closed teardrop, left of the title.
  {
    offset: [-185, 105, -430],
    scale: 17,
    points: [[0, -2], [1.2, -0.6], [0.9, 1], [0, 2.1], [-0.9, 1], [-1.2, -0.6], [0, -2]],
    window: [0.006, 0.03],
  },
  // The Whale — arched back and fluke, right of the title.
  {
    offset: [180, 150, -470],
    scale: 21,
    points: [[-3, 0], [-1.5, 0.8], [0.5, 0.9], [2, 0.3], [3.1, 0.9], [3.5, -0.1], [2.5, 0.1], [1, -0.6], [-1.2, -0.7], [-3, 0]],
    window: [0.026, 0.052],
  },
  // The Bird — spread wings, above the title.
  {
    offset: [-25, 162, -450],
    scale: 19,
    points: [[-3.2, 0.9], [-1.6, 0.1], [0, 0.7], [0.7, 0], [1.9, 0.5], [3.1, 1.3], [1.6, -0.2], [0.2, -1.3]],
    window: [0.048, 0.074],
  },
];

const lineVertex = /* glsl */ `
attribute float aT;
varying float vT;
void main() {
  vT = aT;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const lineFragment = /* glsl */ `
uniform float uDraw;
uniform float uOpacity;
varying float vT;
void main() {
  // The line reveals from its start, with a bright pen-tip at the frontier.
  float drawn = smoothstep(uDraw, uDraw - 0.1, vT);
  float tip = smoothstep(0.06, 0.0, abs(vT - uDraw)) * step(0.01, uDraw) * step(uDraw, 0.99);
  float a = (drawn * 0.4 + tip * 0.9) * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vec3(0.62, 0.72, 1.0) * (1.0 + tip), a);
}
`;

const nodeVertex = /* glsl */ `
attribute float aT;
uniform float uDraw;
uniform float uTime;
uniform float uDpr;
varying float vAlpha;
void main() {
  float lit = smoothstep(uDraw, uDraw - 0.05, aT);
  float tw = 0.7 + 0.3 * sin(uTime * 1.8 + aT * 37.0);
  vAlpha = lit * tw;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 3.2 * uDpr * (300.0 / max(-mv.z, 1.0)) * 3.0;
  gl_Position = projectionMatrix * mv;
}
`;

const nodeFragment = /* glsl */ `
uniform float uOpacity;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d) * vAlpha * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vec3(0.75, 0.82, 1.0), a);
}
`;

interface Figure {
  line: THREE.Line;
  nodes: THREE.Points;
  lineMaterial: THREE.ShaderMaterial;
  nodeMaterial: THREE.ShaderMaterial;
  window: [number, number];
}

export function Constellations() {
  const figures = useMemo<Figure[]>(() => {
    return FIGURES.map((def) => {
      const count = def.points.length;
      const positions = new Float32Array(count * 3);
      const ts = new Float32Array(count);
      def.points.forEach(([x, y], i) => {
        positions[i * 3] = def.offset[0] + x * def.scale;
        positions[i * 3 + 1] = def.offset[1] + y * def.scale;
        positions[i * 3 + 2] = def.offset[2];
        ts[i] = count > 1 ? i / (count - 1) : 0;
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aT", new THREE.BufferAttribute(ts, 1));

      const lineMaterial = new THREE.ShaderMaterial({
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uDraw: { value: 0 }, uOpacity: { value: 0 } },
      });
      const nodeMaterial = new THREE.ShaderMaterial({
        vertexShader: nodeVertex,
        fragmentShader: nodeFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uDraw: { value: 0 },
          uOpacity: { value: 0 },
          uTime: sharedUniforms.uTime,
          uDpr: sharedUniforms.uDpr,
        },
      });
      const line = new THREE.Line(geometry, lineMaterial);
      const nodes = new THREE.Points(geometry, nodeMaterial);
      line.frustumCulled = false;
      nodes.frustumCulled = false;
      return { line, nodes, lineMaterial, nodeMaterial, window: def.window };
    });
  }, []);

  useDisposable(
    ...figures.map((f) => f.line.geometry),
    ...figures.map((f) => f.lineMaterial),
    ...figures.map((f) => f.nodeMaterial),
  );

  useFrame(() => {
    const p = useProgressStore.getState().progress;
    // The figures belong to the night: they dissolve as the void hands over.
    const fade = clamp01(remap(p, 0.115, 0.085, 0, 1)) * uniformProxies.sky.starIntensity;
    for (const figure of figures) {
      const draw = clamp01(remap(p, figure.window[0], figure.window[1], 0, 1));
      const lu = figure.lineMaterial.uniforms;
      const nu = figure.nodeMaterial.uniforms;
      if (lu.uDraw) lu.uDraw.value = draw;
      if (lu.uOpacity) lu.uOpacity.value = fade;
      if (nu.uDraw) nu.uDraw.value = draw;
      if (nu.uOpacity) nu.uOpacity.value = fade;
    }
  });

  return (
    <group>
      {figures.map((figure, i) => (
        <group key={i}>
          <primitive object={figure.line} />
          <primitive object={figure.nodes} />
        </group>
      ))}
    </group>
  );
}
