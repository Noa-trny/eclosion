/** Gerstner wave sum — displaces a plane and accumulates the surface normal. */
export const gerstnerChunk = /* glsl */ `
vec3 gerstnerWave(vec2 dir, float steepness, float wavelength, float speed, vec3 p, float time, inout vec3 tangent, inout vec3 binormal) {
  float k = 6.28318 / wavelength;
  float c = sqrt(9.8 / k) * speed;
  vec2 d = normalize(dir);
  float f = k * (dot(d, p.xz) - c * time);
  float a = steepness / k;
  tangent += vec3(
    -d.x * d.x * (steepness * sin(f)),
    d.x * (steepness * cos(f)),
    -d.x * d.y * (steepness * sin(f))
  );
  binormal += vec3(
    -d.x * d.y * (steepness * sin(f)),
    d.y * (steepness * cos(f)),
    -d.y * d.y * (steepness * sin(f))
  );
  return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
}
`;
