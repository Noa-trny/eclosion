import type { EditorOverrides, EditorPersistence } from "@/types/editor";

const STORAGE_KEY = "eclosion-editor-v1";

export function loadPersisted(): EditorPersistence {
  if (typeof window === "undefined") return { version: 1, overrides: {}, cameraPoints: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, overrides: {}, cameraPoints: {} };
    const parsed = JSON.parse(raw) as EditorPersistence;
    return { version: 1, overrides: parsed.overrides ?? {}, cameraPoints: parsed.cameraPoints ?? {} };
  } catch {
    return { version: 1, overrides: {}, cameraPoints: {} };
  }
}

let pending: EditorPersistence | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

function flush(): void {
  if (!pending || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // Storage full/blocked — the editor still works, it just won't persist.
  }
}

export function saveOverride(key: string, value: EditorOverrides[string]): void {
  if (!pending) pending = loadPersisted();
  pending.overrides[key] = value;
  clearTimeout(timer);
  timer = setTimeout(flush, 300);
}

export function saveCameraPoint(index: number, value: [number, number, number]): void {
  if (!pending) pending = loadPersisted();
  pending.cameraPoints[index] = value;
  clearTimeout(timer);
  timer = setTimeout(flush, 300);
}

export function clearPersisted(): void {
  pending = { version: 1, overrides: {}, cameraPoints: {} };
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}
