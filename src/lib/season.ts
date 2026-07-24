/** The world remembers: each completed crossing turns the season. Visit 1 is
 *  the eternal spring night; return and it is autumn; return again, winter.
 *  Stored locally — the world remembers YOUR browser, no account, no server. */

export type Season = 0 | 1 | 2;

const KEY = "eclosion-crossings";

export function getSeason(): Season {
  try {
    // Dev/testing hook: ?season=1 forces a season without touching storage.
    const forced = new URLSearchParams(window.location.search).get("season");
    if (forced !== null) return Math.min(2, Math.max(0, Number(forced))) as Season;
    const crossings = Number(window.localStorage.getItem(KEY) ?? "0");
    return Math.min(2, Math.max(0, crossings)) as Season;
  } catch {
    return 0;
  }
}

/** Called once when the visitor reaches the dawn — the NEXT visit changes. */
export function markCrossingComplete(): void {
  try {
    const crossings = Number(window.localStorage.getItem(KEY) ?? "0");
    window.localStorage.setItem(KEY, String(crossings + 1));
  } catch {
    // Storage blocked — the world will not remember, and that is fine.
  }
}

interface SeasonLook {
  /** Multiplied into tree foliage/trunk vertex colors. */
  tree: [number, number, number];
  /** Multiplied into flower petal colors. */
  flower: [number, number, number];
  /** Added to the global grade temperature (-cool / +warm). */
  temperature: number;
  /** Multiplied into the global grade saturation. */
  saturation: number;
}

export const SEASON_LOOKS: Record<Season, SeasonLook> = {
  0: { tree: [1, 1, 1], flower: [1, 1, 1], temperature: 0, saturation: 1 },
  // Autumn: foliage rusts to copper and gold, the light warms. Strong on
  // trees — the cool night ambient eats half the shift.
  1: { tree: [2.0, 0.78, 0.26], flower: [1.45, 0.72, 0.38], temperature: 0.09, saturation: 1.04 },
  // Winter: frost-pale foliage, blued light, colour draining away.
  2: { tree: [0.6, 0.74, 1.08], flower: [0.75, 0.85, 1.15], temperature: -0.13, saturation: 0.8 },
};
