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
  vec4 sum = inputColor;
  for (int i = 1; i <= 5; i++) {
    float t = float(i) / 5.0 * uStrength * 0.06;
    sum += texture2D(inputBuffer, uv - dir * t);
  }
  outputColor = sum / 6.0;
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
