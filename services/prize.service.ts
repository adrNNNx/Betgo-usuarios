// services/prize.service.ts
import { api } from "@/lib/api";

// ==================== TIPOS ====================

export type PrizeType = "local" | "jackpot";

export interface PrizeItem {
  id: string;
  name: string;
  description: string | null;
  type: PrizeType;
  barId: string | null;
  value: number | null;
  stock: number | null; // null = ilimitado
  imageUrl: string | null;
  isActive: boolean;
}

// ==================== FUNCIONES ====================

/**
 * Premios globales (jackpot) + locales del bar, activos.
 * Endpoint público — GET /prizes/bar/:barId/all
 *
 * Ordenados: jackpot primero, luego locales por nombre.
 */
export async function getPrizesByBarAndGlobal(
  barId: string
): Promise<PrizeItem[]> {
  const { data } = await api.get<PrizeItem[]>(`/prizes/bar/${barId}/all`);
  return data;
}

/**
 * Solo premios jackpot/globales activos.
 * Endpoint público — GET /prizes/global
 */
export async function getGlobalPrizes(): Promise<PrizeItem[]> {
  const { data } = await api.get<PrizeItem[]>(`/prizes/global`);
  return data;
}
