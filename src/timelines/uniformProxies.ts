/** The single mutable tween-target registry. GSAP (timeline scrub OR weather
 *  sim — never both at once) mutates these plain objects; R3F consumers read
 *  them every frame without any React involvement. */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface UniformProxies {
  fog: { color: Rgb; density: number };
  sky: {
    topColor: Rgb;
    bottomColor: Rgb;
    /** Radians above the horizon (negative = night). */
    sunElevation: number;
    sunAzimuth: number;
    auroraIntensity: number;
    starIntensity: number;
  };
  sun: { intensity: number; color: Rgb };
  ambient: { intensity: number; color: Rgb };
  grade: { temperature: number; saturation: number; lift: number; underwater: number };
  camera: { fovOffset: number; shake: number; focus: number };
  wind: Vec3Like;
  transition: { ripple: number };
  acts: {
    seedGlow: number;
    germination: number;
    rootsGrowth: number;
    treeGrowth: number;
    fireflyIntensity: number;
    moonIntensity: number;
    dustIntensity: number;
    cloudDensity: number;
    rainIntensity: number;
    lightningActivity: number;
    waveHeight: number;
    underwaterLight: number;
    planktonGlow: number;
    fishActivity: number;
    bubbleBurst: number;
    lavaFlow: number;
    emberIntensity: number;
    smokeDensity: number;
    ashFade: number;
    bloomMorph: number;
    birdActivity: number;
    snowIntensity: number;
    sunriseProgress: number;
    finaleSwirl: number;
  };
}

function defaults(): UniformProxies {
  return {
    fog: { color: { r: 0.012, g: 0.016, b: 0.028 }, density: 0.02 },
    sky: {
      topColor: { r: 0.004, g: 0.006, b: 0.012 },
      bottomColor: { r: 0.01, g: 0.012, b: 0.022 },
      sunElevation: -0.35,
      sunAzimuth: 0.4,
      auroraIntensity: 0,
      starIntensity: 1,
    },
    sun: { intensity: 0.05, color: { r: 0.4, g: 0.5, b: 0.8 } },
    ambient: { intensity: 0.06, color: { r: 0.25, g: 0.3, b: 0.5 } },
    grade: { temperature: -0.15, saturation: 0.85, lift: 0, underwater: 0 },
    camera: { fovOffset: 0, shake: 0, focus: 0.02 },
    wind: { x: 0.4, y: 0, z: 0.15 },
    transition: { ripple: 0 },
    acts: {
      seedGlow: 0,
      germination: 0,
      rootsGrowth: 0,
      treeGrowth: 0,
      fireflyIntensity: 0,
      moonIntensity: 0,
      dustIntensity: 1,
      cloudDensity: 0,
      rainIntensity: 0,
      lightningActivity: 0,
      waveHeight: 0.6,
      underwaterLight: 0,
      planktonGlow: 0,
      fishActivity: 0,
      bubbleBurst: 0,
      lavaFlow: 0,
      emberIntensity: 0,
      smokeDensity: 0,
      ashFade: 0,
      bloomMorph: 0,
      birdActivity: 0,
      snowIntensity: 0,
      sunriseProgress: 0,
      finaleSwirl: 0,
    },
  };
}

export const uniformProxies: UniformProxies = defaults();

type NumericTree = { [key: string]: number | NumericTree };

/** Manual numeric deep-clone: GSAP attaches non-cloneable caches (`_gsap`,
 *  functions) to every tween target, so structuredClone would throw. Only
 *  numbers and nested plain objects are part of a snapshot. */
function cloneTree(source: NumericTree): NumericTree {
  const out: NumericTree = {};
  for (const key of Object.keys(source)) {
    if (key.startsWith("_")) continue;
    const value = source[key];
    if (typeof value === "number") out[key] = value;
    else if (value && typeof value === "object") out[key] = cloneTree(value);
  }
  return out;
}

export function snapshotProxies(): UniformProxies {
  return cloneTree(uniformProxies as unknown as NumericTree) as unknown as UniformProxies;
}

function walkAssign(target: NumericTree, source: NumericTree): void {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (typeof sv === "number") {
      target[key] = sv;
    } else if (sv && typeof tv === "object" && tv) {
      walkAssign(tv, sv);
    }
  }
}

function walkLerp(target: NumericTree, a: NumericTree, b: NumericTree, t: number): void {
  for (const key of Object.keys(a)) {
    const av = a[key];
    const bv = b[key];
    const tv = target[key];
    if (typeof av === "number" && typeof bv === "number") {
      target[key] = av + (bv - av) * t;
    } else if (av && bv && typeof av === "object" && typeof bv === "object" && tv && typeof tv === "object") {
      walkLerp(tv, av, bv, t);
    }
  }
}

export function applySnapshot(snapshot: UniformProxies): void {
  walkAssign(uniformProxies as unknown as NumericTree, snapshot as unknown as NumericTree);
}

/** Writes lerp(a, b, t) into the live proxies — used by the free-roam exit
 *  crossfade to hand the simulated weather back to the frozen timeline. */
export function lerpSnapshots(a: UniformProxies, b: UniformProxies, t: number): void {
  walkLerp(uniformProxies as unknown as NumericTree, a as unknown as NumericTree, b as unknown as NumericTree, t);
}
