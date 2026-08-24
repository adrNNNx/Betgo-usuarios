// ResultadoTheme.ts — tokens de la pantalla de resultado.
// Misma paleta del sistema: dorado hue 85 sobre verde profundo hue 160.

export const rt = {
  bg: "oklch(0.2 0.05 160)",
  card: "oklch(0.26 0.04 160)",
  border: "oklch(0.35 0.02 160)",
  primary: "oklch(0.72 0.15 85)",
  primaryHi: "oklch(0.82 0.18 88)",
  primaryFg: "oklch(0.2 0.05 160)",
  fg: "oklch(0.96 0.05 85)",
  muted: "oklch(0.55 0.01 160)",
  mutedBg: "oklch(0.28 0.02 160)",
  destructive: "oklch(0.62 0.22 25)",
  ok: "oklch(0.75 0.14 155)",
  display: '"Montserrat", sans-serif',
  body: '"Poppins", system-ui, sans-serif',
} as const;

/** Mezcla un color del tema con transparencia. */
export const mix = (color: string, pct: number) =>
  `color-mix(in oklch, ${color} ${pct}%, transparent)`;

/** 520800 -> "Gs. 520.800" */
export const fmtGs = (n: number) => `Gs. ${n.toLocaleString("es-PY")}`;
