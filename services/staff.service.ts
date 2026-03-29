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
