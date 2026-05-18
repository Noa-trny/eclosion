export type ActId =
  | "void"
  | "seed"
  | "forest"
  | "storm"
  | "ocean"
  | "volcano"
  | "bloom"
  | "dawn";

export interface ActRange {
  start: number;
  end: number;
}

export interface ActDef {
  id: ActId;
  index: number;
  range: ActRange;
  title: string;
  subtitle: string;
  body: string;
  /** Horizontal alignment of the DOM text block for this act. */
  align: "left" | "right" | "center";
}

export interface ActState {
  index: number;
  local: number;
}
