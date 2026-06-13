/** HRTF panner pool + camera-synced listener. One-shots grab the next panner,
 *  place it in world space, and play through it. */
export class PannerPool {
  private readonly panners: PannerNode[] = [];
  private index = 0;

  constructor(
    private readonly ctx: AudioContext,
    out: AudioNode,
    size = 8,
  ) {
    for (let i = 0; i < size; i++) {
      const panner = new PannerNode(ctx, {
        panningModel: "HRTF",
        distanceModel: "inverse",
        refDistance: 10,
        rolloffFactor: 0.8,
      });
      panner.connect(out);
      this.panners.push(panner);
    }
  }

  /** Returns a panner positioned at (x,y,z) world coordinates. */
  at(x: number, y: number, z: number): PannerNode {
    const panner = this.panners[this.index % this.panners.length];
    this.index++;
    if (!panner) throw new Error("empty panner pool");
    const t = this.ctx.currentTime;
    panner.positionX.setTargetAtTime(x, t, 0.01);
    panner.positionY.setTargetAtTime(y, t, 0.01);
    panner.positionZ.setTargetAtTime(z, t, 0.01);
    return panner;
  }
}

/** setTargetAtTime keeps listener motion zipper-free; called at ~10 Hz. */
export function syncListener(
  ctx: AudioContext,
  position: { x: number; y: number; z: number },
  forward: { x: number; y: number; z: number },
): void {
  const listener = ctx.listener;
  const t = ctx.currentTime;
  if ("positionX" in listener && listener.positionX) {
    listener.positionX.setTargetAtTime(position.x, t, 0.08);
    listener.positionY.setTargetAtTime(position.y, t, 0.08);
    listener.positionZ.setTargetAtTime(position.z, t, 0.08);
    listener.forwardX.setTargetAtTime(forward.x, t, 0.08);
    listener.forwardY.setTargetAtTime(forward.y, t, 0.08);
    listener.forwardZ.setTargetAtTime(forward.z, t, 0.08);
    listener.upX.setTargetAtTime(0, t, 0.08);
    listener.upY.setTargetAtTime(1, t, 0.08);
    listener.upZ.setTargetAtTime(0, t, 0.08);
  }
}
