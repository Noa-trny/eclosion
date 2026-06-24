import { ACTS } from "./acts";
import type { ActId } from "@/types/acts";
import type { Lang } from "@/stores/langStore";

export interface ActCopy {
  title: string;
  subtitle: string;
  body: string;
}

/** French act copy lives in config/acts.ts (single source); English mirrors it. */
const ACT_COPY_EN: Record<ActId, ActCopy> = {
  void: {
    title: "The Void",
    subtitle: "Before the first light",
    body: "In absolute darkness, something waits. A heartbeat. A promise.",
  },
  seed: {
    title: "The Seed",
    subtitle: "First heartbeat",
    body: "A spark of life pierces the night. Beneath the soil, roots reach for water.",
  },
  forest: {
    title: "The Forest",
    subtitle: "The firefly people",
    body: "Trees climb toward the moon. A thousand lights keep watch between the branches.",
  },
  storm: {
    title: "The Storm",
    subtitle: "The sky tears open",
    body: "The rain feeds what the night has sown. Every lightning bolt draws a border.",
  },
  ocean: {
    title: "The Ocean",
    subtitle: "Breathing below the surface",
    body: "Every rain ends here. In the deep blue, life invents its own light.",
  },
  volcano: {
    title: "The Volcano",
    subtitle: "The molten heart",
    body: "The earth forges in fire. The ash already carries tomorrow's gardens.",
  },
  bloom: {
    title: "The Bloom",
    subtitle: "Ash becomes garden",
    body: "Petals open onto a newborn world. Birds write the wind.",
  },
  dawn: {
    title: "The Dawn",
    subtitle: "First morning of the world",
    body: "Light embraces all that lives. The world, at last, opens its eyes.",
  },
};

export const ACT_COPY: Record<Lang, Record<ActId, ActCopy>> = {
  fr: Object.fromEntries(
    ACTS.map((a) => [a.id, { title: a.title, subtitle: a.subtitle, body: a.body }]),
  ) as Record<ActId, ActCopy>,
  en: ACT_COPY_EN,
};

export const UI = {
  fr: {
    act: "Acte",
    tagline: "Une expérience où le défilement est le temps",
    intro:
      "La naissance d'un monde — du néant à l'aube, huit actes portés par la lumière, la matière et le son.",
    sprouting: "le monde germe…",
    enterSound: "Entrer avec le son",
    enterQuiet: "Entrer en silence",
    enter: "Entrer",
    reducedNote: "Animations réduites détectées — l'expérience s'adapte à vos préférences.",
    footer: "Casque recommandé · 100% procédural · WebGL 2",
    scrollHint: "Faites défiler",
    muted: "Muet",
    soundOn: "Son ✓",
    muteLabel: "Couper le son",
    unmuteLabel: "Activer le son",
    explore: "Explorer (F)",
    resume: "Reprendre le récit (F)",
    goToAct: "aller à l'acte",
    freeRoamTitle: "Exploration libre",
    freeRoamHelp:
      "ZQSD / WASD se déplacer · souris regarder · Maj sprint · Espace monter · C descendre · F reprendre le récit",
    endKicker: "Un monde est né",
    endBody: "Du néant à l'aube — merci d'avoir porté ce monde jusqu'à la lumière.",
    replay: "Revoir le récit",
    exploreWorld: "Explorer ce monde (F)",
    share: "Partager l'aube",
    shared: "Lien copié ✓",
    credits: "Conçu et développé par Noa · 100 % procédural — WebGL 2 · Typographie Fraunces (OFL)",
    contextLost: "Le monde se reconstruit… (contexte graphique perdu)",
    acts: "Actes",
  },
  en: {
    act: "Act",
    tagline: "An experience where scrolling is time",
    intro:
      "The birth of a world — from the void to the dawn, eight acts carried by light, matter and sound.",
    sprouting: "the world is sprouting…",
    enterSound: "Enter with sound",
    enterQuiet: "Enter in silence",
    enter: "Enter",
    reducedNote: "Reduced motion detected — the experience adapts to your preferences.",
    footer: "Headphones recommended · 100% procedural · WebGL 2",
    scrollHint: "Scroll",
    muted: "Muted",
    soundOn: "Sound ✓",
    muteLabel: "Mute sound",
    unmuteLabel: "Enable sound",
    explore: "Explore (F)",
    resume: "Return to the story (F)",
    goToAct: "go to act",
    freeRoamTitle: "Free exploration",
    freeRoamHelp:
      "WASD / ZQSD move · mouse look · Shift sprint · Space up · C down · F return to the story",
    endKicker: "A world is born",
    endBody: "From the void to the dawn — thank you for carrying this world into the light.",
    replay: "Replay the story",
    exploreWorld: "Explore this world (F)",
    share: "Share the dawn",
    shared: "Link copied ✓",
    credits: "Designed & built by Noa · 100% procedural — WebGL 2 · Type: Fraunces (OFL)",
    contextLost: "The world is rebuilding… (graphics context lost)",
    acts: "Acts",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiStrings = (typeof UI)[Lang];
