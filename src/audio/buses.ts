import { CROSSFADE_PAD } from "@/config/audio";
import type { ActRange } from "@/types/acts";

/** Equal-power crossfade window over an act's progress range, widened by
 *  ±CROSSFADE_PAD so adjacent acts overlap smoothly. */
export function actGain(progress: number, range: ActRange): number {
  const inStart = range.start - CROSSFADE_PAD;
  const inEnd = range.start + CROSSFADE_PAD;
  const outStart = range.end - CROSSFADE_PAD;
  const outEnd = range.end + CROSSFADE_PAD;
  let fadeIn = 1;
  if (progress < inStart) fadeIn = 0;
  else if (progress < inEnd) fadeIn = Math.sin(((progress - inStart) / (inEnd - inStart)) * Math.PI * 0.5);
  let fadeOut = 1;
  if (progress > outEnd) fadeOut = 0;
  else if (progress > outStart) fadeOut = Math.cos(((progress - outStart) / (outEnd - outStart)) * Math.PI * 0.5);
  return fadeIn * fadeOut;
}
