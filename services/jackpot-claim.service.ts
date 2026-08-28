// services/jackpot-claim.service.ts
import { api } from "@/lib/api";
import type { JackpotClaimStatus } from "./game.service";

// ==================== TIPOS ====================

export interface MyJackpotClaim {
  id: string;
  /** Folio del comprobante, ej. "J-QNXRUM". */
  folio: string;
  amount: number;
  status: JackpotClaimStatus;
  /** ISO — cuándo se ganó el pozo. */
  playedAt: string;
  contactedAt: string | null;
  paidAt: string | null;
  bar: { id: string; name: string } | null;
}

export interface MyJackpotClaimsResponse {
  data: MyJackpotClaim[];
  total: number;
}

// ==================== FUNCIONES ====================

/**
 * Comprobantes de pozo del usuario autenticado.
 * GET /jackpot-claims/my?limit=&offset=
 *
 * A diferencia de los premios físicos, **los comprobantes de pozo no vencen**.
 */
export async function getMyJackpotClaims(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<MyJackpotClaimsResponse> {
  const { data } = await api.get<MyJackpotClaimsResponse>(
    "/jackpot-claims/my",
    { params },
  );
  return data;
}

/**
 * El ganador avisa que contactó a administración: pending_contact → in_review.
 * POST /jackpot-claims/:folio/contact
 *
 * Es idempotente: reintentarlo devuelve el estado actual sin repisar la fecha.
 */
export async function markJackpotContacted(folio: string): Promise<{
  folio: string;
  status: JackpotClaimStatus;
  contactedAt: string | null;
}> {
  const { data } = await api.post(`/jackpot-claims/${folio}/contact`);
  return data;
}
