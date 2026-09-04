// implementacion/juego/juego-theme.ts
/**
 * Acentos por modo de juego.
 *
 * Regla del rediseño: el DORADO pertenece al pozo global y a nada más.
 * La pantalla de jugadas gratuitas usa el verde esmeralda del sistema
 * (mismo hue 158 que ya se usa para "éxito"), así el usuario sabe de un
 * vistazo en qué está jugando sin leer una sola palabra.
 */

export const GOLD = {
  base: "oklch(0.72 0.15 85)",
  bright: "oklch(0.85 0.17 85)",
  deep: "oklch(0.65 0.15 70)",
  fg: "oklch(0.2 0.05 160)",
} as const;

export const EMERALD = {
  base: "oklch(0.74 0.15 158)",
  bright: "oklch(0.82 0.15 158)",
  deep: "oklch(0.62 0.14 158)",
  fg: "oklch(0.16 0.04 160)",
} as const;

export type GameAccent = typeof GOLD;

/** Acento según el modo del slot machine. */
export const accentFor = (mode: "free" | "pool"): GameAccent =>
  mode === "pool" ? GOLD : (EMERALD as unknown as GameAccent);

/** Halo de fondo de la pantalla (va en el contenedor de la screen). */
export const screenAura = (mode: "free" | "pool") =>
  mode === "pool"
    ? "radial-gradient(120% 55% at 50% 0%, oklch(0.72 0.15 85 / 0.13), transparent 60%)"
    : "radial-gradient(120% 55% at 50% 0%, oklch(0.74 0.15 158 / 0.10), transparent 60%)";

/** Gs. 2.4M / Gs. 100k / Gs. 8.500 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return "Gs. " + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + "M";
  }
  if (value >= 1_000) return "Gs. " + Math.floor(value / 1_000) + "k";
  return "Gs. " + value.toLocaleString("es-PY");
}
