/** Shared mailbox between the DOM touch controls (joystick + look surface)
 *  and the canvas-side FreeRoamController — module state, zero re-renders. */
export const touchInput = {
  /** Joystick vector, each axis -1..1 (x = strafe, y = forward). */
  move: { x: 0, y: 0 },
  /** Accumulated look-drag deltas (px) since the last frame consumed them. */
  look: { dx: 0, dy: 0 },
};

export function pushLook(dx: number, dy: number): void {
  touchInput.look.dx += dx;
  touchInput.look.dy += dy;
}

/** Drain the accumulated look deltas (called once per frame). */
export function consumeLook(): { dx: number; dy: number } {
  const out = { dx: touchInput.look.dx, dy: touchInput.look.dy };
  touchInput.look.dx = 0;
  touchInput.look.dy = 0;
  return out;
}

export function resetTouchInput(): void {
  touchInput.move.x = 0;
  touchInput.move.y = 0;
  touchInput.look.dx = 0;
  touchInput.look.dy = 0;
}
