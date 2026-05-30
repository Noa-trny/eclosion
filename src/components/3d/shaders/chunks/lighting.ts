/** Small lighting helpers shared by every custom material. */
export const lightingChunk = /* glsl */ `
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), power);
}

float halfLambert(vec3 normal, vec3 lightDir) {
  float ndl = dot(normalize(normal), normalize(lightDir));
  float hl = ndl * 0.5 + 0.5;
  return hl * hl;
}

vec3 applyFogExp2(vec3 color, float dist, vec3 fogColor, float density) {
  float f = 1.0 - exp(-density * density * dist * dist);
  return mix(color, fogColor, clamp(f, 0.0, 1.0));
}
`;
