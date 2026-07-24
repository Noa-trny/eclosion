"use client";

import { Sun } from "./Sun";
import { DawnClouds } from "./DawnClouds";
import { BirdFlock } from "@/components/3d/scenes/bloom/BirdFlock";
import { GPUParticles } from "@/lib/particles/GPUParticles";
import { PARTICLE_PRESETS } from "@/config/particles";
import { uniformProxies } from "@/timelines/uniformProxies";

/** Act 7 — the finale. The sun crests (god rays), a flock crosses its disc in
 *  silhouette, and "Le Souffle": thousands of light petals lift off the
 *  meadow into a golden vortex climbing toward the light. */
export function DawnScene() {
  return (
    <group>
      <Sun />
      <DawnClouds />
      {/* Silhouettes across the sun's sightline — distant and slow, so they
          read as calligraphy against the disc, never as vertigo. */}
      <BirdFlock center={[472, 38, 66]} size={[64, 20, 46]} baseCount={70} seed={77} speed={4.5} />
      {/* Le Souffle — the closing vortex of light petals. */}
      <GPUParticles
        preset={PARTICLE_PRESETS.pollen}
        position={[416, 22, 60]}
        getIntensity={() => uniformProxies.acts.finaleSwirl}
      />
    </group>
  );
}
