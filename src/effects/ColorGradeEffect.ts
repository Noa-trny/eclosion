import { BlendFunction, Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = /* glsl */ `
uniform float uTemperature;
uniform float uSaturation;
uniform float uLift;
uniform float uUnderwater;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = inputColor.rgb + uLift;
  c.r *= 1.0 + uTemperature * 0.18;
  c.b *= 1.0 - uTemperature * 0.16;
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(luma), c, uSaturation);
  // The dive: a deep teal wash + slight vignette-less darkening.
  c = mix(c, c * vec3(0.3, 0.72, 0.92) + vec3(0.0, 0.02, 0.05), clamp(uUnderwater, 0.0, 1.0) * 0.85);
  outputColor = vec4(c, inputColor.a);
}
`;

/** Timeline-driven grade: temperature/saturation/lift + the underwater wash.
 *  Values are scrubbed by the act builders through uniformProxies.grade. */
export class ColorGradeEffect extends Effect {
  constructor() {
    super("ColorGradeEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uTemperature", new Uniform(0)],
        ["uSaturation", new Uniform(1)],
        ["uLift", new Uniform(0)],
        ["uUnderwater", new Uniform(0)],
      ]),
    });
  }

  setGrade(temperature: number, saturation: number, lift: number, underwater: number): void {
    const t = this.uniforms.get("uTemperature");
    const s = this.uniforms.get("uSaturation");
    const l = this.uniforms.get("uLift");
    const u = this.uniforms.get("uUnderwater");
    if (t) t.value = temperature;
    if (s) s.value = saturation;
    if (l) l.value = lift;
    if (u) u.value = underwater;
  }
}
