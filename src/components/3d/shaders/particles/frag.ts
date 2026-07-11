/** Shared particle fragment: soft circular sprite with a hot core. Every
 *  system glints under the storm's uFlash — rain lighting up on a strike is
 *  what sells the lightning. */
export const particleFragmentShader = /* glsl */ `
uniform float uFlash;
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = smoothstep(0.5, 0.1, d);
  float core = smoothstep(0.16, 0.0, d);
  float a = disc * vAlpha;
  if (a < 0.004) discard;
  vec3 color = vColor * (0.75 + core * 1.5) * (1.0 + uFlash * 1.6);
  gl_FragColor = vec4(color, a);
}
`;
