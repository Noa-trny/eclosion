/** Curl of the simplex field via central differences — divergence-free flow
 *  used for fireflies, ember flutter and drifting motes. Requires noiseChunk. */
export const curlChunk = /* glsl */ `
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  float n1 = snoise3(vec3(p.x, p.y + e, p.z));
  float n2 = snoise3(vec3(p.x, p.y - e, p.z));
  float n3 = snoise3(vec3(p.x, p.y, p.z + e));
  float n4 = snoise3(vec3(p.x, p.y, p.z - e));
  float n5 = snoise3(vec3(p.x + e, p.y, p.z));
  float n6 = snoise3(vec3(p.x - e, p.y, p.z));
  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);
  return normalize(vec3(x, y, z) + 0.0001) * 0.5;
}
`;
