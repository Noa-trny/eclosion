"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { uniformProxies } from "@/timelines/uniformProxies";
import { useDisposable } from "@/hooks/useDisposable";

const METEOR_COUNT = 4;
const X_AXIS = new THREE.Vector3(1, 0, 0);

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float head = smoothstep(0.72, 1.0, vUv.x);
  float tail = pow(vUv.x, 2.4);
  float across = smoothstep(0.5, 0.04, abs(vUv.y - 0.5));
  float a = (tail * 0.65 + head * 1.3) * across * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * (0.7 + head * 1.2), a);
}
`;

interface Meteor {
  wait: number;
  life: number;
  active: boolean;
  position: THREE.Vector3;
  direction: THREE.Vector3;
}

/** Rare bright streaks across the void's sky — a reward for the very first
 *  moments of attention. CPU-driven: 4 quads, one streak every ~5-16s. */
export function ShootingStars() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(9, 0.14), []);
  const materials = useMemo(
    () =>
      Array.from({ length: METEOR_COUNT }, () =>
        new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          uniforms: { uOpacity: { value: 0 } },
        }),
      ),
    [],
  );
  useDisposable(geometry, ...materials);
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const meteors = useRef<Meteor[]>(
    Array.from({ length: METEOR_COUNT }, (_, i) => ({
      wait: 3 + i * 4 + Math.random() * 6,
      life: 0,
      active: false,
      position: new THREE.Vector3(),
      direction: new THREE.Vector3(),
    })),
  );
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const starVisibility = uniformProxies.sky.starIntensity;
    meteors.current.forEach((meteor, i) => {
      const mesh = meshRefs.current[i];
      const opacity = materials[i]?.uniforms.uOpacity;
      if (!mesh || !opacity) return;
      if (!meteor.active) {
        opacity.value = 0;
        mesh.visible = false;
        meteor.wait -= dt;
        if (meteor.wait <= 0 && starVisibility > 0.4) {
          meteor.active = true;
          meteor.life = 0;
          meteor.position.set(
            (Math.random() - 0.5) * 240,
            70 + Math.random() * 80,
            -40 + (Math.random() - 0.5) * 180,
          );
          meteor.direction
            .set(0.5 + Math.random() * 0.6, -(0.35 + Math.random() * 0.4), (Math.random() - 0.5) * 0.5)
            .normalize();
        }
        return;
      }
      meteor.life += dt / 0.75;
      meteor.position.addScaledVector(meteor.direction, dt * 150);
      if (meteor.life >= 1) {
        meteor.active = false;
        meteor.wait = 5 + Math.random() * 11;
        return;
      }
      mesh.visible = true;
      mesh.position.copy(meteor.position);
      quat.setFromUnitVectors(X_AXIS, meteor.direction);
      mesh.quaternion.copy(quat);
      opacity.value = Math.sin(meteor.life * Math.PI) * starVisibility;
    });
  });

  return (
    <group>
      {materials.map((material, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          geometry={geometry}
          material={material}
          visible={false}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
