import * as THREE from "three";

/** Lathed seed husk — slightly asymmetric, pointed at the top. */
export function createSeedGeometry(): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Egg-like profile: wide at 40% height, tapering to a point.
    const r = Math.sin(t * Math.PI) * (0.42 - t * 0.12);
    const y = t * 1.35 - 0.6;
    profile.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  return new THREE.LatheGeometry(profile, 26);
}
