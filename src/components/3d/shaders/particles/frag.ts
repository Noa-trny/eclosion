/** Shared particle fragment: soft circular sprite with a hot core. */
export const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = smoothstep(0.5, 0.1, d);
  float core = smoothstep(0.16, 0.0, d);
  float a = disc * vAlpha;
  if (a < 0.004) discard;
  vec3 color = vColor * (0.75 + core * 1.5);
  gl_FragColor = vec4(color, a);
}
`;
