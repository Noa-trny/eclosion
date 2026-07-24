/** One roll per mount — an encounter either happens on this crossing or it
 *  does not. `?encounters` forces every one (dev/verification). */
export function rollEncounter(chance: number): boolean {
  try {
    if (new URLSearchParams(window.location.search).has("encounters")) return true;
  } catch {
    // No window (SSR guard) — fall through to the roll.
  }
  return Math.random() < chance;
}
