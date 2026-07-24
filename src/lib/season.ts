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
  /** Multiplied into EVERY environment colour (fog, sky, sun, ambient) —
   *  this is what makes the whole film breathe the season. */
  env: [number, number, number];
  /** 0..1 pull of environment colours toward grey (winter's draining). */
  desat: number;
  /** Added to the global grade temperature (-cool / +warm). */
  temperature: number;
  /** Multiplied into the global grade saturation. */
  saturation: number;
}

export const SEASON_LOOKS: Record<Season, SeasonLook> = {
  0: { tree: [1, 1, 1], flower: [1, 1, 1], env: [1, 1, 1], desat: 0, temperature: 0, saturation: 1 },
  // Autumn: foliage rusts to copper and gold, every sky warms toward amber.
  1: {
    tree: [2.0, 0.78, 0.26],
    flower: [1.45, 0.72, 0.38],
    env: [1.22, 0.97, 0.72],
    desat: 0,
    temperature: 0.14,
    saturation: 1.05,
  },
  // Winter: frost-pale foliage, blued skies, colour draining away.
  2: {
    tree: [0.6, 0.74, 1.08],
    flower: [0.75, 0.85, 1.15],
    env: [0.78, 0.9, 1.2],
    desat: 0.3,
    temperature: -0.2,
    saturation: 0.72,
  },
};

/** In-place season transform for an environment colour channel triple. */
export function applySeasonToColor(
  c: { r: number; g: number; b: number },
  look: SeasonLook,
): void {
  c.r *= look.env[0];
  c.g *= look.env[1];
  c.b *= look.env[2];
  if (look.desat > 0) {
    const grey = (c.r + c.g + c.b) / 3;
    c.r += (grey - c.r) * look.desat;
    c.g += (grey - c.g) * look.desat;
    c.b += (grey - c.b) * look.desat;
  }
}
