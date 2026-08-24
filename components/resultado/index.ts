export { ResultadoScreen, default as default } from "./ResultadoScreen";
export type { ResultadoScreenProps, ResultadoOutcome, PremioGanado, JackpotGanado } from "./ResultadoScreen";
export {
  ResultadoShell, ResultadoKeyframes, VenueChip, PrizeImage, WinBanner, WinBannerNote,
  PozoHero, SectionSep, PrizeCard, GhostButton, PlainButton, NoPrizeHead,
} from "./ResultadoParts";
export type { PozoHeroProps, PrizeCardProps } from "./ResultadoParts";
export { rt as resultadoTheme, mix, fmtGs } from "./ResultadoTheme";

/* Pozo global ganado — pantalla e identidad propias. */
export { JackpotScreen } from "./JackpotScreen";
export type { JackpotScreenProps } from "./JackpotScreen";
export {
  JackpotKeyframes, JackpotHero, JackpotRays, JackpotTicket, JackpotSteps, JackpotNotice,
  JackpotPending, JackpotCta, JackpotGhost, JackpotPlain, JackpotSep, PozoReset,
} from "./JackpotParts";
export { jt as jackpotTheme, jmix } from "./JackpotTheme";
export type { JackpotStatus } from "./JackpotTheme";
