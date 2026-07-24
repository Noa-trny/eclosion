import { ACTS } from "@/config/acts";
import { ACT_COPY } from "@/config/i18n";
import type { Lang } from "@/stores/langStore";
import { ActIllustration } from "./ActIllustrations";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** The whole narrative as plain, accessible HTML — the same 8 acts. */
export function StorySections({ lang }: { lang: Lang }) {
  const actWord = lang === "fr" ? "Acte" : "Act";
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-20">
      {ACTS.map((act) => {
        const copy = ACT_COPY[lang][act.id];
        return (
          <section key={act.id} aria-labelledby={`act-${act.id}`}>
            <ActIllustration act={act.id} />
            <p className="mt-6 text-[11px] uppercase tracking-[0.45em] text-white/45">
              {actWord} {ROMAN[act.index]} - {copy.subtitle}
            </p>
            <h2 id={`act-${act.id}`} className="font-display mt-2 text-4xl text-white/95 sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">{copy.body}</p>
          </section>
        );
      })}
    </div>
  );
}
