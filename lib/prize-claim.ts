// lib/prize-claim.ts
import type { MyPrizeClaim } from "@/services/prize-claim.service";

/**
 * Reglas de vencimiento de un claim, del lado del cliente.
 *
 * El backend (`prize-claim.entity.ts`) define
 *   isExpired() = status === EXPIRED || new Date() > expiresAt
 * y la transición a EXPIRED sólo se materializa cuando el staff consulta sus
 * pendientes. Es decir: un claim puede seguir `pending` en la base y estar
 * vencido en la realidad. Nunca confiar sólo en `status`.
 */

/** Ventana de reclamo: 7 días desde que se ganó. */
export const CLAIM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * sessionStorage: dónde estaba el usuario antes de entrar a /premios.
 * Lo escribe quien navega, lo lee la pantalla para el botón "volver".
 * Vive acá y no en la page para no importar un módulo de ruta desde otra ruta.
 */
export const PREMIOS_RETURN_KEY = "betgoPremiosReturn";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export type EffectiveStatus = "pending" | "delivered" | "expired";
/** Qué tan apurado está el usuario. */
export type Urgency = "critical" | "soon" | "calm";

/** Estado real, calculado contra el reloj. */
export function effectiveStatus(
  claim: Pick<MyPrizeClaim, "status" | "expiresAt">,
  now: number = Date.now(),
): EffectiveStatus {
  if (claim.status === "delivered") return "delivered";
  if (claim.status === "expired") return "expired";
  return new Date(claim.expiresAt).getTime() <= now ? "expired" : "pending";
}

/** Milisegundos hasta el vencimiento (negativo si ya venció). */
export function msUntilExpiry(
  claim: Pick<MyPrizeClaim, "expiresAt">,
  now: number = Date.now(),
): number {
  return new Date(claim.expiresAt).getTime() - now;
}

export function urgencyOf(msLeft: number): Urgency {
  if (msLeft <= DAY) return "critical";
  if (msLeft <= 3 * DAY) return "soon";
  return "calm";
}

/** Fracción de la ventana de 7 días que todavía queda (0–1). */
export function remainingFraction(
  claim: Pick<MyPrizeClaim, "expiresAt">,
  now: number = Date.now(),
): number {
  const left = msUntilExpiry(claim, now);
  return Math.max(0, Math.min(1, left / CLAIM_TTL_MS));
}

/** "5 h 20 min", "1 día 8 h", "12 min". Sin el prefijo "Vence en". */
export function formatTimeLeft(msLeft: number): string {
  if (msLeft <= 0) return "vencido";
  if (msLeft < 60 * 1000) return "menos de 1 min";
  if (msLeft < HOUR) return `${Math.floor(msLeft / 60000)} min`;
  if (msLeft < DAY) {
    const h = Math.floor(msLeft / HOUR);
    const m = Math.floor((msLeft % HOUR) / 60000);
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }
  const d = Math.floor(msLeft / DAY);
  const h = Math.floor((msLeft % DAY) / HOUR);
  const label = d === 1 ? "1 día" : `${d} días`;
  return h > 0 && d < 3 ? `${label} ${h} h` : label;
}

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
});
const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "4 ago, 21:40" */
export function formatWonAt(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/** "4 ago" */
export function formatShortDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** Pendientes primero y ordenados por urgencia: el que vence antes, arriba. */
export function sortByUrgency<T extends Pick<MyPrizeClaim, "expiresAt">>(
  claims: T[],
): T[] {
  return [...claims].sort(
    (a, b) =>
      new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
  );
}

/** Historial: lo más reciente primero. */
export function sortByRecency<T extends Pick<MyPrizeClaim, "createdAt" | "deliveredAt">>(
  claims: T[],
): T[] {
  const key = (c: T) =>
    new Date(c.deliveredAt ?? c.createdAt).getTime();
  return [...claims].sort((a, b) => key(b) - key(a));
}
