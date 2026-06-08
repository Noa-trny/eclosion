import type { Metadata } from "next";
import Link from "next/link";
import { StorySections } from "./StorySections";

export const metadata: Metadata = {
  title: "Éclosion — le récit (version accessible)",
  description:
    "La naissance d'un monde en huit actes — version texte et illustrations, sans WebGL.",
};

/** Pure server component: works with JavaScript disabled and on any device.
 *  The immersive route redirects here automatically when WebGL2 is missing. */
export default function FallbackPage() {
  return (
    <main className="min-h-screen bg-[#020308] px-6 py-20 sm:px-10">
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <p className="text-[11px] uppercase tracking-[0.6em] text-white/40">
          Une expérience où le défilement est le temps
        </p>
        <h1 className="font-display mt-4 text-6xl tracking-[0.14em] text-white">ÉCLOSION</h1>
        <p className="mt-4 text-sm text-white/55">
          Votre appareil ne prend pas en charge la version immersive (WebGL&nbsp;2) — voici le
          récit complet.{" "}
          <Link href="/" className="underline decoration-white/40 underline-offset-4 hover:text-white">
            Réessayer la version 3D
          </Link>
        </p>
      </header>
      <StorySections />
      <footer className="mx-auto mt-24 max-w-2xl text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
        100% procédural · aucun asset externe
      </footer>
    </main>
  );
}
