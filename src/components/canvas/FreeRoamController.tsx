"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAppStore } from "@/stores/appStore";
import { enterFreeRoam, exitFreeRoam } from "@/lib/modeMachine";
import { FREE_ROAM } from "@/config/controls";
import { WATER_LEVEL } from "@/config/world";
import { groundHeight } from "@/utils/terrain";
import { clamp } from "@/utils/math";
import { OrbitFallbackControls } from "./OrbitFallbackControls";

/** FPS exploration: WASD + mouse-look (pointer lock), E/Q for up/down, Shift
 *  to sprint. Initializes from the rig's exact pose so entering free-roam is
 *  seamless; exiting tweens back through the mode machine. */
export function FreeRoamController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const mode = useAppStore((s) => s.mode);
  const keys = useRef(new Set<string>());
  const view = useRef({ yaw: 0, pitch: 0 });
  const velocity = useRef(new THREE.Vector3()).current;
  const ramp = useRef(0);
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);
  const coarse = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  // The HUD button / F key bump modeToggleNonce; this component owns the
  // camera, so it performs the actual transitions.
  useEffect(() => {
    let last = useAppStore.getState().modeToggleNonce;
    return useAppStore.subscribe((s) => {
      if (s.modeToggleNonce === last) return;
      last = s.modeToggleNonce;
      if (s.mode === "scroll") enterFreeRoam();
      else if (s.mode === "free") exitFreeRoam(camera);
    });
  }, [camera]);

  useEffect(() => {
    if (mode !== "free" || coarse) return;
    const canvas = gl.domElement;
    const e = euler.setFromQuaternion(camera.quaternion);
    view.current.yaw = e.y;
    view.current.pitch = e.x;
    ramp.current = 0;
    velocity.set(0, 0, 0);

    const requestLock = (): void => {
      if (document.pointerLockElement !== canvas && !useAppStore.getState().editorOpen) {
        canvas.requestPointerLock();
      }
    };
    const onMove = (ev: MouseEvent): void => {
      if (document.pointerLockElement !== canvas) return;
      view.current.yaw -= ev.movementX * FREE_ROAM.lookSensitivity;
      view.current.pitch = clamp(view.current.pitch - ev.movementY * FREE_ROAM.lookSensitivity, -1.45, 1.45);
    };
    const onDown = (ev: KeyboardEvent): void => {
      keys.current.add(ev.code);
    };
    const onUp = (ev: KeyboardEvent): void => {
      keys.current.delete(ev.code);
    };

    canvas.addEventListener("click", requestLock);
    document.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    requestLock();
    const currentKeys = keys.current;
    return () => {
      canvas.removeEventListener("click", requestLock);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      currentKeys.clear();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, [mode, coarse, camera, gl, euler, velocity]);

  useFrame((_, delta) => {
    if (useAppStore.getState().mode !== "free" || coarse) return;
    const dt = Math.min(delta, 0.05);
    ramp.current = Math.min(1, ramp.current + dt / FREE_ROAM.rampIn);

    euler.set(view.current.pitch, view.current.yaw, 0);
    camera.quaternion.setFromEuler(euler);

    const k = keys.current;
    const speed =
      FREE_ROAM.moveSpeed * (k.has("ShiftLeft") || k.has("ShiftRight") ? FREE_ROAM.fastMultiplier : 1) * ramp.current;
    const sinY = Math.sin(view.current.yaw);
    const cosY = Math.cos(view.current.yaw);
    let fx = 0;
    let fz = 0;
    let fy = 0;
    // QWERTY (WASD) and AZERTY (ZQSD) both supported.
    if (k.has("KeyW") || k.has("KeyZ") || k.has("ArrowUp")) { fx -= sinY; fz -= cosY; }
    if (k.has("KeyS") || k.has("ArrowDown")) { fx += sinY; fz += cosY; }
    if (k.has("KeyA") || k.has("KeyQ") || k.has("ArrowLeft")) { fx -= cosY; fz += sinY; }
    if (k.has("KeyD") || k.has("ArrowRight")) { fx += cosY; fz -= sinY; }
    if (k.has("Space") || k.has("KeyE")) fy += 1;
    if (k.has("KeyC")) fy -= 1;
    const len = Math.hypot(fx, fz) || 1;

    const lambda = FREE_ROAM.damping;
    velocity.x += ((fx / len) * speed - velocity.x) * (1 - Math.exp(-lambda * dt));
    velocity.z += ((fz / len) * speed - velocity.z) * (1 - Math.exp(-lambda * dt));
    velocity.y += (fy * speed * 0.8 - velocity.y) * (1 - Math.exp(-lambda * dt));
    camera.position.addScaledVector(velocity, dt);

    // Walk the same analytic ground everything renders from; over the ocean
    // basin you can swim below the surface (but not through the sea floor).
    const ground = groundHeight(camera.position.x, camera.position.z);
    const minY = ground < WATER_LEVEL - 2 ? ground + 0.6 : ground + FREE_ROAM.eyeHeight;
    if (camera.position.y < minY) {
      camera.position.y = minY;
      velocity.y = Math.max(velocity.y, 0);
    }
  });

  if (mode === "free" && coarse) return <OrbitFallbackControls />;
  return null;
}
