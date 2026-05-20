/** Flat key → number/color overrides persisted by the editor. */
export type EditorOverrides = Record<string, number | string | boolean>;

export interface EditorPersistence {
  version: number;
  overrides: EditorOverrides;
  /** Camera control point overrides, keyed by point index. */
  cameraPoints: Record<number, [number, number, number]>;
}
