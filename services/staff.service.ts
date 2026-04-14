// services/staff.service.ts
import { api } from "@/lib/api";

// ==================== TIPOS ====================

export interface StaffProfile {
  id: string;
  role: string;
  bar: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
}

export interface ValidatedPlayer {
  codeId: string;
  code: string;
  user: {
    id: string;
    name: string | null;
    phone: string;
    balance: number;
  };
  expiresAt: string;
  expiresInSeconds: number;
}

export interface LoadBalanceRequest {
  code: string;
  amount: number;
  paymentMethod: "cash" | "transfer" | "qr" | "card" | "other";
  notes?: string;
}

export interface LoadBalanceResponse {
  success: boolean;
  amountLoaded: number;
  user: {
    id: string;
    name: string | null;
    newBalance: number;
  };
  transactionId: string;
}

// ==================== FUNCIONES ====================

/**
 * Obtener perfil del staff (bar asignado, rol, datos).
 * GET /staff/me
 */
export async function getMyStaffProfile(): Promise<StaffProfile> {
  const { data } = await api.get<StaffProfile>("/staff/me");
  return data;
}

/**
 * Validar código de recarga de un jugador.
 * POST /recharge-codes/validate
 */
export async function validateRechargeCode(
  code: string
): Promise<ValidatedPlayer> {
  const { data } = await api.post<ValidatedPlayer>(
    "/recharge-codes/validate",
    { code }
  );
  return data;
}

/**
 * Ejecutar carga de saldo al jugador.
 * POST /recharge-codes/load
 */
export async function loadPlayerBalance(
  request: LoadBalanceRequest
): Promise<LoadBalanceResponse> {
  const { data } = await api.post<LoadBalanceResponse>(
    "/recharge-codes/load",
    request
  );
  return data;
}

// ==================== PRIZE CLAIMS ====================

export interface ValidatedPrizeClaim {
  claimId: string;
  claimCode: string;
  status: string;
  prize: {
    id: string;
    name: string;
    type: string;
    value: number | null;
    imageUrl: string | null;
    description: string | null;
  };
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
  bar: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  expiresAt: string;
}

export interface DeliverPrizeResponse {
  success: boolean;
  claimCode: string;
  prize: {
    name: string;
    value: number | null;
  };
  user: {
    name: string | null;
    phone: string;
  };
  deliveredAt: string;
}

export interface PendingClaimItem {
  id: string;
  claimCode: string;
  prize: {
    name: string;
    type: string;
    value: number | null;
    imageUrl: string | null;
  };
  user: {
    name: string | null;
    phone: string;
  };
  createdAt: string;
  expiresAt: string;
}

/**
 * Validar código de premio (mozo escanea o ingresa).
 * POST /prize-claims/validate
 */
export async function validatePrizeClaim(
  code: string
): Promise<ValidatedPrizeClaim> {
  const { data } = await api.post<ValidatedPrizeClaim>(
    "/prize-claims/validate",
    { code }
  );
  return data;
}

/**
 * Marcar premio como entregado.
 * POST /prize-claims/deliver
 */
export async function deliverPrize(
  code: string,
  notes?: string
): Promise<DeliverPrizeResponse> {
  const { data } = await api.post<DeliverPrizeResponse>(
    "/prize-claims/deliver",
    { code, notes }
  );
  return data;
}

/**
 * Listar premios pendientes del bar del mozo.
 * GET /prize-claims/pending
 */
export async function getPendingClaims(): Promise<PendingClaimItem[]> {
  const { data } = await api.get<PendingClaimItem[]>(
    "/prize-claims/pending"
  );
  return data;
}
