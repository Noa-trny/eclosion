import { BlendFunction, Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = /* glsl */ `
uniform float uStrength;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uStrength < 0.002) {
    outputColor = inputColor;
    return;
  }
  vec2 dir = uv - 0.5;
  // Ten weighted taps with a fading tail. Five uniform taps over the old
  // 6%-of-screen reach turned every bright particle into five distinct ghost
  // copies — the ocean's plankton field became a wall of white scratches the
  // moment the dive picked up speed. Denser sampling over a shorter reach
  // with decaying weights reads as a comet trail instead of a dashed line.
  vec4 sum = inputColor;
  float total = 1.0;
  for (int i = 1; i <= 10; i++) {
    float f = float(i) / 10.0;
    float w = 1.0 - f * 0.85;
    sum += texture2D(inputBuffer, uv - dir * (f * uStrength * 0.045)) * w;
    total += w;
  }
  outputColor = sum / total;
}
`;

/** Radial blur scaled by scroll velocity — a cheap, honest motion blur. */
export class SpeedBlurEffect extends Effect {
  constructor() {
    super("SpeedBlurEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([["uStrength", new Uniform(0)]]),
    });
  }

  setStrength(value: number): void {
    const u = this.uniforms.get("uStrength");
    if (u) u.value = value;
  }
}
