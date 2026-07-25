import * as THREE from "three";

export interface TitleTexture {
  texture: THREE.CanvasTexture;
  aspect: number;
}

/** The display family as the browser resolved it (next/font hashed name). */
function displayFamily(): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
  return family.length > 0 ? family : "Georgia, serif";
}

export const TITLE_FONT_PX = 300;

/** Pre-warms the display font at the title weight so canvases draw with
 *  Fraunces, not the serif fallback. */
export function loadTitleFont(): Promise<unknown> {
  return document.fonts.load(`500 ${TITLE_FONT_PX}px ${displayFamily()}`).catch(() => undefined);
}

/** Rasterizes an act title once into a texture the 3D planes can carry.
 *  White on transparent; a faint self-glow keeps thin serifs alive under
 *  DOF and fog. */
export function createTitleTexture(text: string): TitleTexture | null {
  const font = `500 ${TITLE_FONT_PX}px ${displayFamily()}`;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const pad = 72;
  canvas.width = Math.ceil(metrics.width + pad * 2);
  canvas.height = Math.ceil(TITLE_FONT_PX * 1.5);
  // Resizing resets the context state — set the font again before drawing.
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.shadowBlur = 26;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, pad, TITLE_FONT_PX * 1.06);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { texture, aspect: canvas.width / canvas.height };
}
