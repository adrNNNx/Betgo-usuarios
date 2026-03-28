// services/recharge.service.ts
import { api } from "@/lib/api";

// ==================== TIPOS ====================

export interface GenerateCodeResponse {
  code: string;
  qrData: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface CodeStatusResponse {
  status: "pending" | "used" | "expired";
  expiresAt: string;
  expiresInSeconds: number;
  isExpired: boolean;
  /** Solo presente cuando status = 'used' */
  amountLoaded?: number;
}

// ==================== FUNCIONES ====================

/**
 * Generar código de recarga.
 * POST /recharge-codes/generate
 *
 * Invalida cualquier código pendiente anterior del usuario.
 * El código expira en 90 segundos.
 */
export async function generateRechargeCode(): Promise<GenerateCodeResponse> {
  const { data } = await api.post<GenerateCodeResponse>(
    "/recharge-codes/generate"
  );
  return data;
}

/**
 * Consultar estado de un código (polling).
 * GET /recharge-codes/status/:code
 *
 * - pending: el mozo aún no procesó
 * - used: el mozo cargó el saldo (amountLoaded disponible)
 * - expired: el código expiró
 */
export async function getRechargeCodeStatus(
  code: string
): Promise<CodeStatusResponse> {
  const { data } = await api.get<CodeStatusResponse>(
    `/recharge-codes/status/${code}`
  );
  return data;
}
