/** Single shared world layout — every scene, the camera path, the physics and
 *  the free-roam ground clamp all derive from these coordinates. */

export const WATER_LEVEL = -2;

export const OCEAN_CENTER: readonly [number, number] = [150, 10];
export const OCEAN_RADIUS = 85;
export const OCEAN_DEPTH = 26;

export const VOLCANO_CENTER: readonly [number, number] = [300, -50];
export const VOLCANO_RADIUS = 75;
export const VOLCANO_HEIGHT = 55;
export const CRATER_RADIUS = 14;

export const MEADOW_CENTER: readonly [number, number] = [375, 40];

export const FOREST_CENTER: readonly [number, number] = [-5, -30];
export const FOREST_RADIUS = 55;

export const SEED_POSITION: readonly [number, number, number] = [0, 1.2, 0];

/** Far-away anchor the dawn sun rises toward. */
export const SUN_ANCHOR: readonly [number, number, number] = [560, 40, 70];

export const WORLD_BOUNDS = { minX: -80, maxX: 480, minZ: -160, maxZ: 160 };
