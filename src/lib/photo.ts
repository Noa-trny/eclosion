import { useAppStore } from "@/stores/appStore";
import { useProgressStore } from "@/stores/progressStore";
import { useLangStore } from "@/stores/langStore";
import { ACTS, getActState } from "@/config/acts";
import { ACT_COPY } from "@/config/i18n";
import { getConstellation } from "@/lib/journeyTrace";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function displayFamily(): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
  return family.length > 0 ? family : "Georgia, serif";
}

/** Composes the captured frame into a postcard — the image on a dark mount,
 *  signed with the title, the act and the address — then shares it (touch)
 *  or downloads it. Needs preserveDrawingBuffer on the renderer. */
export function capturePhoto(): void {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
  const { index } = getActState(useProgressStore.getState().progress);
  const act = ACTS[index];
  const lang = useLangStore.getState().lang;
  const actLine = act
    ? `${lang === "fr" ? "ACTE" : "ACT"} ${ROMAN[index]} - ${ACT_COPY[lang][act.id].title.toUpperCase()}`
    : "";
  const family = displayFamily();

  void document.fonts
    .load(`500 80px ${family}`)
    .catch(() => undefined)
    .then(() => {
      const w = canvas.width;
      const h = canvas.height;
      const margin = Math.round(w * 0.035);
      const footer = Math.round(w * 0.085);
      const card = document.createElement("canvas");
      card.width = w + margin * 2;
      card.height = h + margin + footer;
      const ctx = card.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#0a0c12";
      ctx.fillRect(0, 0, card.width, card.height);
      ctx.drawImage(canvas, margin, margin, w, h);

      // The visitor's constellation signs the sky — their crossing, so far.
      const stars = getConstellation();
      if (stars.length > 0) {
        const bw = w * 0.2;
        const bh = h * 0.14;
        const bx = margin + w - bw - w * 0.04;
        const by = margin + h * 0.05;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 236, 200, 0.4)";
        ctx.lineWidth = Math.max(1, w * 0.0006);
        ctx.beginPath();
        stars.forEach((s, i) => {
          const sx = bx + s.x * bw;
          const sy = by + s.y * bh;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 236, 200, 0.9)";
        ctx.shadowColor = "rgba(255, 220, 160, 0.9)";
        ctx.shadowBlur = w * 0.004;
        for (const s of stars) {
          ctx.beginPath();
          ctx.arc(bx + s.x * bw, by + s.y * bh, (1 + s.w * 2.2) * (w / 1600), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      const baseline = h + margin + footer * 0.62;
      ctx.fillStyle = "#f2ede4";
      ctx.font = `500 ${Math.round(footer * 0.42)}px ${family}`;
      ctx.fillText("ÉCLOSION", margin, baseline);

      ctx.letterSpacing = `${Math.round(footer * 0.045)}px`;
      ctx.font = `400 ${Math.round(footer * 0.13)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillStyle = "rgba(242, 237, 228, 0.55)";
      ctx.textAlign = "right";
      ctx.fillText(actLine, margin + w, baseline - footer * 0.22);
      ctx.fillText(window.location.host.toUpperCase(), margin + w, baseline + footer * 0.08);
      ctx.textAlign = "left";

      card.toBlob((blob) => {
        if (!blob) return;
        const name = `eclosion-${act?.id ?? "monde"}.png`;
        void deliver(blob, name).then(() => useAppStore.getState().photoTaken());
      }, "image/png");
    });
}

/** Native share sheet on touch devices (the postcard is MADE for it);
 *  a plain download everywhere else. */
async function deliver(blob: Blob, name: string): Promise<void> {
  const file = new File([blob], name, { type: "image/png" });
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Éclosion" });
      return;
    } catch {
      // Cancelled or unsupported mid-flight — fall through to download.
    }
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
