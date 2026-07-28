import { BlendFunction, Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = /* glsl */ `
uniform float uEdgeThreshold;
uniform float uEdgeThresholdMin;

float fxaaLuma(const in vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 t = texelSize;

  float lM = fxaaLuma(inputColor.rgb);
  float lN = fxaaLuma(texture2D(inputBuffer, uv + vec2(0.0,  t.y)).rgb);
  float lS = fxaaLuma(texture2D(inputBuffer, uv + vec2(0.0, -t.y)).rgb);
  float lE = fxaaLuma(texture2D(inputBuffer, uv + vec2( t.x, 0.0)).rgb);
  float lW = fxaaLuma(texture2D(inputBuffer, uv + vec2(-t.x, 0.0)).rgb);

  float lMin = min(lM, min(min(lN, lS), min(lE, lW)));
  float lMax = max(lM, max(max(lN, lS), max(lE, lW)));
  float range = lMax - lMin;

  // Flat area: the vast majority of pixels in the dark acts leave here, so
  // the eight extra taps below are only ever paid along real edges.
  if (range < max(uEdgeThresholdMin, lMax * uEdgeThreshold)) {
    outputColor = inputColor;
    return;
  }

  float lNW = fxaaLuma(texture2D(inputBuffer, uv + vec2(-t.x,  t.y)).rgb);
  float lNE = fxaaLuma(texture2D(inputBuffer, uv + vec2( t.x,  t.y)).rgb);
  float lSW = fxaaLuma(texture2D(inputBuffer, uv + vec2(-t.x, -t.y)).rgb);
  float lSE = fxaaLuma(texture2D(inputBuffer, uv + vec2( t.x, -t.y)).rgb);

  // Edge direction from the corner luma gradient, normalised so that near-
  // axis-aligned edges still get a usable step.
  vec2 dir = vec2(
    -((lNW + lNE) - (lSW + lSE)),
     ((lNW + lSW) - (lNE + lSE))
  );
  float reduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
  float rcpMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + reduce);
  dir = clamp(dir * rcpMin, -8.0, 8.0) * t;

  vec3 rgbA = 0.5 * (
    texture2D(inputBuffer, uv + dir * -0.16666667).rgb +
    texture2D(inputBuffer, uv + dir *  0.16666667).rgb
  );
  vec3 rgbB = rgbA * 0.5 + 0.25 * (
    texture2D(inputBuffer, uv + dir * -0.5).rgb +
    texture2D(inputBuffer, uv + dir *  0.5).rgb
  );

  // The wider tap pair overshoots on thin features — fall back to the narrow
  // average whenever it lands outside the neighbourhood's luma range.
  float lB = fxaaLuma(rgbB);
  outputColor = vec4(lB < lMin || lB > lMax ? rgbA : rgbB, inputColor.a);
}
`;

/** FXAA — the antialiasing the medium tier's preset asks for.
 *
 *  Every phone lands on medium (the tier is capped on touch devices), and SMAA
 *  costs them a lookup texture, extra passes and a large program to compile at
 *  boot. This is one convolution pass with an early-out on flat pixels: far
 *  cheaper, and honest about being a blur rather than a reconstruction. */
export class FXAAEffect extends Effect {
  constructor(edgeThreshold = 0.125, edgeThresholdMin = 0.0312) {
    super("FXAAEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      // Merged into the shared effect pass and reading neighbours straight
      // from inputBuffer, exactly like SpeedBlurEffect. Declaring CONVOLUTION
      // instead would demand a pass of its own, which the composer never
      // finishes building here — the warm-up then hangs on "boot".
      uniforms: new Map<string, Uniform>([
        ["uEdgeThreshold", new Uniform(edgeThreshold)],
        ["uEdgeThresholdMin", new Uniform(edgeThresholdMin)],
      ]),
    });
  }
}
