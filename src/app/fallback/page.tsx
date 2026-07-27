import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/stores/langStore";
import { StorySections } from "./StorySections";

export const metadata: Metadata = {
  title: "Éclosion - le récit (version accessible)",
  description:
    "La naissance d'un monde en huit actes : version texte et illustrations, sans WebGL.",
};

const STRINGS: Record<Lang, { tagline: string; note: string; retry: string; footer: string; other: string }> = {
  fr: {
    tagline: "Une expérience où le défilement est le temps",
    note: "Votre appareil ne prend pas en charge la version immersive (WebGL 2) : voici le récit complet.",
    retry: "Réessayer la version 3D",
    footer: "100% procédural · aucun asset externe",
    other: "Read in English",
  },
  en: {
    tagline: "An experience where scrolling is time",
    note: "Your device doesn't support the immersive version (WebGL 2): here is the full story.",
    retry: "Try the 3D version",
    footer: "100% procedural · no external assets",
    other: "Lire en français",
  },
};

/** Pure server component: works with JavaScript disabled and on any device.
 *  The immersive route redirects here automatically when WebGL2 is missing. */
export default async function FallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const lang: Lang = (await searchParams).lang === "en" ? "en" : "fr";
  const t = STRINGS[lang];
  const otherHref = lang === "fr" ? "/fallback?lang=en" : "/fallback";

  return (
    <main lang={lang} className="min-h-screen bg-[#020308] px-6 py-20 sm:px-10">
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <p className="text-[11px] uppercase tracking-[0.6em] text-white/40">{t.tagline}</p>
        <h1 className="font-display mt-4 text-6xl tracking-[0.14em] text-white">ÉCLOSION</h1>
        <p className="mt-4 text-sm text-white/55">
          {t.note}{" "}
          <Link href="/" className="underline decoration-white/40 underline-offset-4 hover:text-white">
            {t.retry}
          </Link>{" "}
          ·{" "}
          <Link href={otherHref} className="underline decoration-white/40 underline-offset-4 hover:text-white">
            {t.other}
          </Link>
        </p>
      </header>
      <StorySections lang={lang} />
      <footer className="mx-auto mt-24 max-w-2xl text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
        {t.footer}
      </footer>
    </main>
  );
}
