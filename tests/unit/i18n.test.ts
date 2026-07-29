import { describe, expect, it } from "vitest";
import { ACTS } from "@/config/acts";
import { ACT_COPY } from "@/config/i18n";

/** The narrative overlay, the in-world titles and the accessible fallback all
 *  read from ACT_COPY — a hole in either language ships as a blank line. */
describe("FR/EN narrative parity", () => {
  const langs = ["fr", "en"] as const;

  it("every act has a complete copy in both languages", () => {
    for (const lang of langs) {
      for (const act of ACTS) {
        const copy = ACT_COPY[lang][act.id];
        expect(copy, `${lang}/${act.id}`).toBeDefined();
        expect(copy.title.trim(), `${lang}/${act.id} title`).not.toBe("");
        expect(copy.subtitle.trim(), `${lang}/${act.id} subtitle`).not.toBe("");
        expect(copy.body.trim(), `${lang}/${act.id} body`).not.toBe("");
      }
    }
  });

  it("no language leaks into the other (titles differ)", () => {
    for (const act of ACTS) {
      expect(ACT_COPY.fr[act.id].title).not.toBe(ACT_COPY.en[act.id].title);
    }
  });
});
