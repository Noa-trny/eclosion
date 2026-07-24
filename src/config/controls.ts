export const FREE_ROAM = {
  moveSpeed: 14,
  fastMultiplier: 2.6,
  lookSensitivity: 0.0022,
  /** Touch drag-look (px -> rad): no pointer lock, so a fuller swing per px. */
  touchLookSensitivity: 0.0045,
  eyeHeight: 1.7,
  /** Seconds to ramp movement in after entering free-roam (avoids a jolt). */
  rampIn: 0.6,
  damping: 8,
} as const;

export const KEYS = {
  freeRoam: "KeyF",
  mute: "KeyM",
  editor: "Backquote",
} as const;
