import { noiseChunk } from "./chunks/noise";

export const skyVertexShader = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const skyFragmentShader = /* glsl */ `
${noiseChunk}
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform float uAurora;
uniform float uFlash;
uniform float uTime;
uniform float uUnderwater;
uniform vec3 uFogColor;
varying vec3 vDir;

void main() {
  vec3 dir = normalize(vDir);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uSkyBottom, uSkyTop, pow(h, 0.72));

  // Directional halo only — the sun DISC is the Sun/Moon mesh (god-ray
  // source), so the dome never draws a competing second sun.
  float sunD = max(dot(dir, normalize(uSunDir)), 0.0);
  col += uSunColor * pow(sunD, 32.0) * 0.06 * clamp(uSunIntensity, 0.0, 1.0);

  // Aurora / bioluminescent sheen high in the sky.
  if (uAurora > 0.001) {
    float band = fbm2(vec2(dir.x * 2.5 + uTime * 0.03, dir.y * 5.0 - uTime * 0.015));
    float mask = smoothstep(0.12, 0.55, dir.y) * smoothstep(0.9, 0.45, dir.y);
    vec3 auroraCol = mix(vec3(0.05, 0.75, 0.5), vec3(0.2, 0.35, 0.9), band * 0.5 + 0.5);
    col += auroraCol * max(band, 0.0) * mask * uAurora * 0.6;
  }

  // Lightning washes the whole dome.
  col += vec3(0.75, 0.8, 1.0) * uFlash * 0.6;

  // Under the surface there is no night sky: the dome IS the water. Without
  // this, every fogged silhouette (the basin rim, the surface's far reach)
  // cut a hard line against a dark dome no diver should ever see.
  col = mix(col, uFogColor, uUnderwater);

  // Dither against banding in the dark acts.
  col += (hash21(gl_FragCoord.xy) - 0.5) * 0.006;
  gl_FragColor = vec4(col, 1.0);
}
`;
