// lib/jackpot.ts

/**
 * Folio del comprobante a partir del id de jugada.
 *
 * El backend todavía no emite folio propio (TODO-BACKEND.md §2). Se deriva del
 * `playId` para que sea rastreable de verdad: administración puede buscar la
 * jugada por ese prefijo, y el comprobante muestra además el id completo.
 * Cuando el backend mande su propio folio, esta función se borra.
 */
export function jackpotFolio(playId: string): string {
  return `J-${playId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
