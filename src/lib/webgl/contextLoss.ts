import { useAppStore } from "@/stores/appStore";

/** three re-uploads its own resources on restore, but the post-processing
 *  composer holds raw render targets — bumping restoreNonce remounts it. */
export function attachContextLossHandlers(canvas: HTMLCanvasElement): () => void {
  const onLost = (event: Event): void => {
    event.preventDefault();
    useAppStore.setState({ contextLost: true });
  };
  const onRestored = (): void => {
    useAppStore.setState((s) => ({ contextLost: false, restoreNonce: s.restoreNonce + 1 }));
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);
  return () => {
    canvas.removeEventListener("webglcontextlost", onLost, false);
    canvas.removeEventListener("webglcontextrestored", onRestored, false);
  };
}
