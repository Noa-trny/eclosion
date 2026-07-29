import { describe, expect, it } from "vitest";
import { mulberry32, randRange } from "@/utils/random";
import { clamp01, damp, lerp, smootherstep, smoothstep } from "@/utils/math";
import { groundHeight, groundNormal } from "@/utils/terrain";
import {
  MEADOW_CENTER,
  OCEAN_CENTER,
  VOLCANO_CENTER,
  WATER_LEVEL,
  WORLD_BOUNDS,
} from "@/config/world";

describe("seeded randomness is reproducible", () => {
  it("same seed, same sequence — the whole procedural world depends on it", () => {
    const a = mulberry32(4242);
    const b = mulberry32(4242);
    for (let i = 0; i < 1000; i++) expect(a()).toBe(b());
  });

  it("stays in [0, 1) and different seeds diverge", () => {
    const rng = mulberry32(1337);
    const other = mulberry32(1338);
    let identical = true;
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      if (v !== other()) identical = false;
    }
    expect(identical).toBe(false);
  });

  it("randRange maps into the asked interval", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = randRange(rng, -3, 5);
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThan(5);
    }
  });
});

describe("the analytic ground", () => {
  it("is finite over the whole world (a NaN here breaks physics, boids and free-roam)", () => {
    for (let x = WORLD_BOUNDS.minX; x <= WORLD_BOUNDS.maxX; x += 7) {
      for (let z = WORLD_BOUNDS.minZ; z <= WORLD_BOUNDS.maxZ; z += 7) {
        expect(Number.isFinite(groundHeight(x, z))).toBe(true);
      }
    }
  });

  it("is deterministic", () => {
    expect(groundHeight(12.5, -33.2)).toBe(groundHeight(12.5, -33.2));
  });

  it("digs the ocean under the water line and raises the volcano above the meadow", () => {
    const ocean = groundHeight(OCEAN_CENTER[0], OCEAN_CENTER[1]);
    const meadow = groundHeight(MEADOW_CENTER[0], MEADOW_CENTER[1]);
    const volcanoRim = groundHeight(VOLCANO_CENTER[0] + 30, VOLCANO_CENTER[1]);
    expect(ocean).toBeLessThan(WATER_LEVEL);
    expect(meadow).toBeGreaterThan(WATER_LEVEL);
    expect(volcanoRim).toBeGreaterThan(meadow);
  });

  it("normals are unit-length and mostly upward on open ground", () => {
    const n = { x: 0, y: 0, z: 0 };
    groundNormal(MEADOW_CENTER[0], MEADOW_CENTER[1], n);
    const len = Math.hypot(n.x, n.y, n.z);
    expect(len).toBeCloseTo(1, 5);
    expect(n.y).toBeGreaterThan(0.5);
  });
});

describe("easing primitives", () => {
  it("hold their endpoints", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(lerp(3, 7, 0.5)).toBe(5);
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 1)).toBe(1);
    expect(smootherstep(0, 1, 0)).toBe(0);
    expect(smootherstep(0, 1, 1)).toBe(1);
  });

  it("damp converges toward the target and never overshoots", () => {
    let v = 0;
    for (let i = 0; i < 200; i++) v = damp(v, 10, 9, 1 / 60);
    expect(v).toBeGreaterThan(9.99);
    expect(v).toBeLessThanOrEqual(10);
  });
});
