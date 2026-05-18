import type { ActDef, ActState } from "@/types/acts";

/** An act mounts when progress enters range ± MOUNT_PAD and unmounts only
 *  once progress leaves range ± UNMOUNT_PAD (hysteresis against thrash). */
export const MOUNT_PAD = 0.05;
export const UNMOUNT_PAD = 0.07;

export const ACTS: readonly ActDef[] = [
  {
    id: "void",
    index: 0,
    range: { start: 0, end: 0.08 },
    title: "Le Néant",
    subtitle: "Avant la première lumière",
    body: "Dans l'obscurité absolue, quelque chose attend. Un battement. Une promesse.",
    align: "center",
  },
  {
    id: "seed",
    index: 1,
    range: { start: 0.08, end: 0.2 },
    title: "La Graine",
    subtitle: "Premier battement",
    body: "Une étincelle de vie perce la nuit. Sous la terre, des racines cherchent l'eau.",
    align: "left",
  },
  {
    id: "forest",
    index: 2,
    range: { start: 0.2, end: 0.35 },
    title: "La Forêt",
    subtitle: "Le peuple des lucioles",
    body: "Les arbres montent vers la lune. Mille lumières veillent entre les branches.",
    align: "right",
  },
  {
    id: "storm",
    index: 3,
    range: { start: 0.35, end: 0.47 },
    title: "L'Orage",
    subtitle: "Le ciel se déchire",
    body: "La pluie nourrit ce que la nuit a semé. Chaque éclair écrit une frontière.",
    align: "left",
  },
  {
    id: "ocean",
    index: 4,
    range: { start: 0.47, end: 0.62 },
    title: "L'Océan",
    subtitle: "Respirer sous la surface",
    body: "Le monde bascule. Dans le bleu profond, la vie invente sa propre lumière.",
    align: "right",
  },
  {
    id: "volcano",
    index: 5,
    range: { start: 0.62, end: 0.76 },
    title: "Le Volcan",
    subtitle: "Le cœur en fusion",
    body: "La terre forge dans le feu. La cendre porte déjà les jardins de demain.",
    align: "left",
  },
  {
    id: "bloom",
    index: 6,
    range: { start: 0.76, end: 0.88 },
    title: "L'Éclosion",
    subtitle: "La cendre devient jardin",
    body: "Des pétales s'ouvrent sur un monde neuf. Les oiseaux dessinent le vent.",
    align: "right",
  },
  {
    id: "dawn",
    index: 7,
    range: { start: 0.88, end: 1 },
    title: "L'Aube",
    subtitle: "Premier matin du monde",
    body: "La lumière embrasse tout ce qui vit. Le monde, enfin, ouvre les yeux.",
    align: "center",
  },
];

/** Maps a global progress to the act index + progress local to that act. */
export function getActState(progress: number): ActState {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = ACTS.length - 1; i >= 0; i--) {
    const act = ACTS[i];
    if (act && p >= act.range.start) {
      const span = act.range.end - act.range.start;
      return { index: i, local: span > 0 ? Math.min(1, (p - act.range.start) / span) : 0 };
    }
  }
  return { index: 0, local: 0 };
}

/** True when the act should be mounted for this progress (with hysteresis). */
export function isActInWindow(index: number, progress: number, mounted: boolean): boolean {
  const act = ACTS[index];
  if (!act) return false;
  const pad = mounted ? UNMOUNT_PAD : MOUNT_PAD;
  return progress >= act.range.start - pad && progress <= act.range.end + pad;
}
