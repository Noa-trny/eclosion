import { describe, expect, it } from "vitest";
import { ACTS, getActState, isActInWindow, MOUNT_PAD, UNMOUNT_PAD } from "@/config/acts";

describe("the eight acts tile the whole film", () => {
  it("covers [0, 1] with no gap and no overlap", () => {
    expect(ACTS[0]?.range.start).toBe(0);
    expect(ACTS[ACTS.length - 1]?.range.end).toBe(1);
    for (let i = 1; i < ACTS.length; i++) {
      expect(ACTS[i]?.range.start).toBe(ACTS[i - 1]?.range.end);
    }
  });

  it("indexes agree with array positions", () => {
    ACTS.forEach((act, i) => expect(act.index).toBe(i));
  });

  it("maps every progress to its act, local in [0, 1]", () => {
    for (let p = 0; p <= 1.0001; p += 0.001) {
      const { index, local } = getActState(p);
      const act = ACTS[index];
      expect(act).toBeDefined();
      if (!act) continue;
      const clamped = Math.min(1, Math.max(0, p));
      expect(clamped).toBeGreaterThanOrEqual(act.range.start);
      if (index < ACTS.length - 1) expect(clamped).toBeLessThanOrEqual(act.range.end);
      expect(local).toBeGreaterThanOrEqual(0);
      expect(local).toBeLessThanOrEqual(1);
    }
  });

  it("clamps out-of-range progress instead of exploding", () => {
    expect(getActState(-0.5).index).toBe(0);
    expect(getActState(1.5).index).toBe(ACTS.length - 1);
  });
});

describe("mount hysteresis", () => {
  it("mounts earlier than it unmounts (no thrash at the boundary)", () => {
    expect(UNMOUNT_PAD).toBeGreaterThan(MOUNT_PAD);
    const forest = 2;
    const start = ACTS[forest]?.range.start ?? 0;
    // Just before the mount window: stays down. Inside it: comes up.
    expect(isActInWindow(forest, start - MOUNT_PAD - 0.001, false)).toBe(false);
    expect(isActInWindow(forest, start - MOUNT_PAD + 0.001, false)).toBe(true);
    // Once mounted, it survives past the mount edge until the unmount pad.
    expect(isActInWindow(forest, start - UNMOUNT_PAD + 0.001, true)).toBe(true);
    expect(isActInWindow(forest, start - UNMOUNT_PAD - 0.001, true)).toBe(false);
  });
});
