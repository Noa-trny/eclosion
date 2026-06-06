import { BlendFunction, Effect } from "postprocessing";
import { Uniform, type WebGLRenderer, type WebGLRenderTarget } from "three";

const fragmentShader = /* glsl */ `
uniform float uRipple;
uniform float uPhase;

void mainUv(inout vec2 uv) {
  if (uRipple < 0.002) return;
  vec2 d = uv - 0.5;
  float dist = length(d);
  uv += normalize(d + 0.0001) * sin(dist * 42.0 - uPhase * 9.0) * 0.022 * uRipple;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}
`;

/** The dive/emerge ripple — a radial distortion pulsed by the ocean and
 *  volcano act builders through uniformProxies.transition.ripple. */
export class ActTransitionEffect extends Effect {
  constructor() {
    super("ActTransitionEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uRipple", new Uniform(0)],
        ["uPhase", new Uniform(0)],
      ]),
    });
  }

  setRipple(value: number): void {
    const u = this.uniforms.get("uRipple");
    if (u) u.value = value;
  }

  override update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime = 0): void {
    const p = this.uniforms.get("uPhase");
    if (p) p.value += deltaTime;
  }
}
