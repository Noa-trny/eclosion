import { create } from "zustand";
import type { ActId } from "@/types/acts";
import type { Lang } from "@/stores/langStore";

/** Eight hidden haikus — one discreet glowing sigil per act; touching it
 *  reveals the act's poem. Found ones persist locally: the collection is the
 *  first real reason to cross the world again, searching. */
export const HAIKUS: Record<ActId, Record<Lang, [string, string, string]>> = {
  void: {
    fr: ["Dans le noir absolu", "une graine rêvait déjà", "de devenir monde"],
    en: ["In the absolute dark", "a seed was already dreaming", "of becoming world"],
  },
  seed: {
    fr: ["Premier battement —", "la terre apprend par cœur", "le nom de la pluie"],
    en: ["First heartbeat —", "the earth learns by heart", "the name of the rain"],
  },
  forest: {
    fr: ["Mille lucioles", "recousent la nuit déchirée", "entre les branches"],
    en: ["A thousand fireflies", "stitching the torn night", "between the branches"],
  },
  storm: {
    fr: ["L'éclair signe le ciel", "d'une écriture trop vive", "pour être relue"],
    en: ["Lightning signs the sky", "in a hand too quick", "to be read twice"],
  },
  ocean: {
    fr: ["Sous la surface", "même le silence apprend", "à faire de la lumière"],
    en: ["Below the surface", "even silence learns", "how to make light"],
  },
  volcano: {
    fr: ["Le feu ne détruit pas —", "il forge en secret", "les jardins de demain"],
    en: ["Fire does not destroy —", "it secretly forges", "tomorrow's gardens"],
  },
  bloom: {
    fr: ["La cendre se souvient", "d'avoir été forêt —", "elle éclot"],
    en: ["The ash remembers", "it was once a forest —", "it blooms"],
  },
  dawn: {
    fr: ["Le premier matin", "n'appartient à personne —", "il t'attendait"],
    en: ["The first morning", "belongs to no one —", "it was waiting for you"],
  },
};

const KEY = "eclosion-haikus";

function load(): ActId[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActId[]) : [];
  } catch {
    return [];
  }
}

interface HaikuState {
  collected: ActId[];
  /** The haiku currently shown as an overlay, if any. */
  reveal: ActId | null;
  hydrate: () => void;
  collect: (id: ActId) => void;
  closeReveal: () => void;
}

export const useHaikuStore = create<HaikuState>((set) => ({
  collected: [],
  reveal: null,
  /** Post-mount localStorage read — SSR markup must not depend on it. */
  hydrate: () => set({ collected: load() }),
  collect: (id) =>
    set((s) => {
      const collected = s.collected.includes(id) ? s.collected : [...s.collected, id];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(collected));
      } catch {
        // Storage blocked — the find still shows, it just won't persist.
      }
      return { collected, reveal: id };
    }),
  closeReveal: () => set({ reveal: null }),
}));
