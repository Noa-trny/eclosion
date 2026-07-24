import { BlendFunction, Effect } from "postprocessing";
import { Uniform, type WebGLRenderer, type WebGLRenderTarget } from "three";

/** Raindrops ON the lens: the storm suddenly admits there is a camera — and
 *  therefore a witness. Two layers of cellular droplets refract the frame
 *  (mainUv displaces the sample), plus running drips that streak downward. */
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAmount;

vec2 hash22(vec2 p) {
  vec3 a = fract(p.xyx * vec3(123.34, 234.34, 345.65));
  a += dot(a, a + 34.45);
  return fract(vec2(a.x * a.y, a.y * a.z));
}

// One droplet layer: cells, each holding a drop that lives and fades on its
// own clock. Returns the refraction offset; accumulates rim darkening.
vec2 dropLayer(vec2 uv, float cells, float t, inout float rim) {
  vec2 grid = uv * cells;
  vec2 id = floor(grid);
  vec2 f = fract(grid) - 0.5;
  vec2 rnd = hash22(id);
  // Each cell's drop appears somewhere inside it, on a looping lifetime.
  float life = fract(t * 0.1 + rnd.y * 8.0);
  vec2 center = (rnd - 0.5) * 0.62;
  float radius = (0.08 + rnd.x * 0.1) * smoothstep(0.0, 0.12, life) * smoothstep(1.0, 0.55, life);
  vec2 d = f - center;
  float dist = length(d);
  float inside = smoothstep(radius, radius * 0.62, dist);
  rim += (smoothstep(radius, radius * 0.85, dist) - inside) * 0.5;
  // Refract: the drop is a tiny lens — sample AWAY from its center, flipped.
  return inside * normalize(d + 1e-5) * (radius - dist) * 2.6;
}

// Running drips: columns where a drop slides down, leaving a wobbling trail.
vec2 dripLayer(vec2 uv, float t, inout float rim) {
  float col = uv.x * 22.0;
  vec2 id = vec2(floor(col), 0.0);
  vec2 rnd = hash22(id);
  float x = fract(col) - 0.5 + sin(uv.y * 34.0 + rnd.x * 6.28) * 0.08;
  float head = fract(-t * (0.06 + rnd.y * 0.1) + rnd.x * 5.0);
  float dy = uv.y - head;
  float trail = smoothstep(0.0, 0.25, dy) * smoothstep(0.5, 0.25, dy);
  float w = 0.1 * (1.0 - dy);
  float on = step(0.55, rnd.y);
  float body = smoothstep(w, w * 0.4, abs(x)) * trail * on;
  rim += body * 0.22;
  return vec2(0.0, body * 0.02);
}

void mainUv(inout vec2 uv) {
  if (uAmount < 0.01) return;
  float rim = 0.0;
  vec2 offset = dropLayer(uv, 9.0, uTime, rim) * 0.028;
  offset += dropLayer(uv + 0.37, 16.0, uTime * 1.3 + 4.0, rim) * 0.016;
  offset += dripLayer(uv, uTime, rim);
  uv += offset * uAmount;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}
`;

export class LensRainEffect extends Effect {
  constructor() {
    super("LensRainEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uTime", new Uniform(0)],
        ["uAmount", new Uniform(0)],
      ]),
    });
  }

  override update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime = 0): void {
    const t = this.uniforms.get("uTime");
    if (t) t.value += deltaTime;
  }

  setAmount(value: number): void {
    const amount = this.uniforms.get("uAmount");
    if (amount) amount.value = value;
  }
}
