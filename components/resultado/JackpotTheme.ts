// JackpotTheme.ts — paleta EXCLUSIVA del pozo global ganado.
// Deliberadamente distinta al resto: casi negro cálido + dorado, en vez del verde del sistema.
export const jt = {
  bg: "oklch(0.13 0.025 80)",
  card: "oklch(0.19 0.03 80)",
  line: "oklch(0.32 0.03 85)",
  gold: "oklch(0.78 0.15 85)",
  goldHi: "oklch(0.9 0.13 92)",
  goldDeep: "oklch(0.62 0.13 78)",
  ink: "oklch(0.16 0.03 80)",
  fg: "oklch(0.97 0.02 90)",
  muted: "oklch(0.62 0.02 85)",
  mutedBg: "oklch(0.24 0.025 80)",
  ok: "oklch(0.75 0.14 155)",
  green: "oklch(0.2 0.05 160)",
  greenCard: "oklch(0.26 0.04 160)",
  greenBorder: "oklch(0.35 0.02 160)",
  display: '"Montserrat", sans-serif',
  body: '"Poppins", system-ui, sans-serif',
} as const;

export const jmix = (color: string, pct: number) => `color-mix(in oklch, ${color} ${pct}%, transparent)`;

/** Estados del retiro del pozo. */
export type JackpotStatus = "pending_contact" | "in_review" | "paid";
