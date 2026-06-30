import { useAppStore } from "@/stores/appStore";
import { useProgressStore } from "@/stores/progressStore";

/** Captures the WebGL canvas (pure render — DOM chrome lives outside it) and
 *  downloads it. Needs preserveDrawingBuffer on the renderer. */
export function capturePhoto(): void {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const progress = Math.round(useProgressStore.getState().progress * 100);
    anchor.href = url;
    anchor.download = `eclosion-${String(progress).padStart(2, "0")}.png`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    useAppStore.getState().photoTaken();
  }, "image/png");
}
