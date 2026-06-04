import gsap from "gsap";
import * as THREE from "three";
import { useAppStore } from "@/stores/appStore";
import { useWeatherStore } from "@/stores/weatherStore";
import { useProgressStore } from "@/stores/progressStore";
import {
  applySnapshot,
  lerpSnapshots,
  snapshotProxies,
  type UniformProxies,
} from "@/timelines/uniformProxies";
import { sampleCameraPath, type CameraPose } from "@/timelines/cameraPath";
import { startScroll, stopScroll } from "./scrollControl";
import { weatherSim } from "./weather/simulation";

/** Snapshot of the proxies at the moment we left the timeline — restored (via
 *  a crossfade) when the visitor returns to the story. */
let timelineSnapshot: UniformProxies | null = null;

const pose: CameraPose = {
  position: new THREE.Vector3(),
  lookAt: new THREE.Vector3(),
  fov: 55,
};
const startPos = new THREE.Vector3();
const startQuat = new THREE.Quaternion();
const targetQuat = new THREE.Quaternion();
const helper = new THREE.Object3D();

/** scroll → free. Lenis stops ⇒ scrollTop is pinned ⇒ progress p0 is exact.
 *  The free camera starts from the rig's current pose — no cut, no tween. */
export function enterFreeRoam(): void {
  const app = useAppStore.getState();
  if (app.mode !== "scroll") return;
  timelineSnapshot = snapshotProxies();
  stopScroll();
  useWeatherStore.getState().setSource("sim");
  weatherSim.start();
  app.setMode("free");
}

/** free → scroll. 1.4s: the camera slerps back to the rig pose at p0 while the
 *  simulated weather crossfades to the frozen timeline snapshot. */
export function exitFreeRoam(camera: THREE.PerspectiveCamera): void {
  const app = useAppStore.getState();
  if (app.mode !== "free" || !timelineSnapshot) return;
  app.setMode("toScroll");
  weatherSim.stop();

  const finalSnapshot = timelineSnapshot;
  const simSnapshot = snapshotProxies();
  const p0 = useProgressStore.getState().progress;
  sampleCameraPath(p0, pose);
  startPos.copy(camera.position);
  startQuat.copy(camera.quaternion);
  helper.position.copy(pose.position);
  helper.lookAt(pose.lookAt);
  targetQuat.copy(helper.quaternion);
  const startFov = camera.fov;

  const t = { v: 0 };
  gsap.to(t, {
    v: 1,
    duration: 1.4,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.position.lerpVectors(startPos, pose.position, t.v);
      camera.quaternion.slerpQuaternions(startQuat, targetQuat, t.v);
      camera.fov = startFov + (pose.fov - startFov) * t.v;
      camera.updateProjectionMatrix();
      lerpSnapshots(simSnapshot, finalSnapshot, t.v);
    },
    onComplete: () => {
      applySnapshot(finalSnapshot);
      useWeatherStore.getState().setSource("timeline");
      useAppStore.getState().setMode("scroll");
      startScroll();
      timelineSnapshot = null;
    },
  });
}
