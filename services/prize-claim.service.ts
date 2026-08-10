// services/prize-claim.service.ts
import { api } from "@/lib/api";

// ==================== TIPOS ====================

/** Estado tal como lo guarda el backend. Ojo: no alcanza para saber si venció. */
export type ClaimStatus = "pending" | "delivered" | "expired";

export interface MyPrizeClaimPrize {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number | null;
  imageUrl: string | null;
}

export interface MyPrizeClaimBar {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface MyPrizeClaim {
  id: string;
  /** Formato "P-XXXXXXXX" — es lo que se codifica en el QR. */
  claimCode: string;
  status: ClaimStatus;
  /** ISO — cuándo lo ganó. */
  createdAt: string;
  /** ISO — vence a los 7 días de createdAt. */
  expiresAt: string;
  deliveredAt: string | null;
  prize: MyPrizeClaimPrize;
  bar: MyPrizeClaimBar | null;
}

export interface MyPrizeClaimsResponse {
  data: MyPrizeClaim[];
  total: number;
}

export interface GetMyPrizeClaimsParams {
  status?: ClaimStatus;
  limit?: number;
  offset?: number;
}

// ==================== FUNCIONES ====================

/**
 * Premios reclamados por el usuario autenticado, de TODOS los bares.
 *
 * ⚠️ Endpoint todavía no implementado en el backend — ver TODO-BACKEND.md §4.
 * Hoy todo `/prize-claims` es STAFF/ADMIN. El contrato asumido es:
 *
 *   GET /prize-claims/my?status=&limit=&offset=   (JWT de usuario común)
 *   → { data: MyPrizeClaim[], total: number }
 *
 * Sin `status` devuelve todos (pendientes, entregados y vencidos).
 */
export async function getMyPrizeClaims(
  params: GetMyPrizeClaimsParams = {},
): Promise<MyPrizeClaimsResponse> {
  const { data } = await api.get<MyPrizeClaimsResponse>("/prize-claims/my", {
    params,
  });
  return data;
}
