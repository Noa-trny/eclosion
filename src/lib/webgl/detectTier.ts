import type { Tier } from "@/types/quality";

/** Heuristic GPU tiering from the unmasked renderer string + device hints.
 *  Deliberately avoids detect-gpu's CDN benchmark fetch — no network, no
 *  external dependency; the PerformanceMonitor corrects mistakes at runtime. */
export function detectTier(gl: WebGLRenderingContext | WebGL2RenderingContext): Tier {
  let renderer = "";
  try {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
  } catch {
    // Some browsers block the extension — fall through to heuristics.
  }

  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const memory = "deviceMemory" in navigator ? Number((navigator as { deviceMemory?: number }).deviceMemory) : 8;

  let tier: Tier = "medium";
  if (/(RTX|GTX 1[6-9]|GTX 2\d|Radeon RX|Apple M\d|Apple GPU)/i.test(renderer)) tier = "high";
  if (/(Intel.*(UHD|HD Graphics)|Mali-[GT]?[0-6]|Adreno [0-5]\d\d\b|SwiftShader|llvmpipe)/i.test(renderer)) tier = "low";
  if (memory <= 4 && tier === "high") tier = "medium";
  if (isMobile && tier === "high") tier = "medium";
  return tier;
}
