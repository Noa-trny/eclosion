import { BlendFunction, Effect } from "postprocessing";
import { Uniform, type WebGLRenderer, type WebGLRenderTarget } from "three";

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAmount;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float g = fract(sin(dot(uv * (1.0 + fract(uTime)), vec2(12.9898, 78.233))) * 43758.5453);
  outputColor = vec4(inputColor.rgb + (g - 0.5) * uAmount, inputColor.a);
}
`;

/** Animated film grain — subtle, framerate-independent. */
export class GrainEffect extends Effect {
  constructor(amount = 0.045) {
    super("GrainEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uTime", new Uniform(0)],
        ["uAmount", new Uniform(amount)],
      ]),
    });
  }

  override update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime = 0): void {
    const t = this.uniforms.get("uTime");
    if (t) t.value += deltaTime;
  }
}
