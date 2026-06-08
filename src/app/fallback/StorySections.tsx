import { ACTS } from "@/config/acts";
import { ActIllustration } from "./ActIllustrations";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** The whole narrative as plain, accessible HTML — the same 8 acts. */
export function StorySections() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-20">
      {ACTS.map((act) => (
        <section key={act.id} aria-labelledby={`act-${act.id}`}>
          <ActIllustration act={act.id} />
          <p className="mt-6 text-[11px] uppercase tracking-[0.45em] text-white/45">
            Acte {ROMAN[act.index]} — {act.subtitle}
          </p>
          <h2 id={`act-${act.id}`} className="font-display mt-2 text-4xl text-white/95 sm:text-5xl">
            {act.title}
          </h2>
          <p className="mt-4 leading-relaxed text-white/65">{act.body}</p>
        </section>
      ))}
    </div>
  );
}
