// services/game.service.ts
import { api } from "@/lib/api";

// ==================== TIPOS DE RESPUESTA DEL BACKEND ====================

export interface BarPublicInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  freePlaysPerDay: number;
}

export interface BarAccessResponse {
  bar: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    freePlaysPerDay: number;
  };
  session: {
    playsRemaining: number;
    playsUsed: number;
    playsLimit: number;
    userBalance: number;
  };
  globalPool: {
    currentAmount: number;
    costPerPlay: number;
  };
}

export interface BarSymbolResponse {
  id: string;
  name: string;
  imageUrl: string;
  weight: number;
  hasPrize: boolean;
  isGlobal: boolean;
  isJackpot: boolean;
}

export interface PlayResultResponse {
  playId: string;
  symbols: string[];
  symbolDetails: Array<{ id: string; name: string; imageUrl: string }>;
  isWinner: boolean;
  prize: {
    id: string;
    name: string;
    type: string;
    value?: number;
    claimCode?: string;
  } | null;
  session: {
    playsRemaining: number;
    playsUsed: number;
    balance: number;
  };
  poolAmount?: number;
}

export interface PoolStatusResponse {
  currentAmount: number;
  costPerPlay: number;
  lastWinner?: {
    name: string;
    amount: number;
    date: string;
  };
}

export interface DailySummaryResponse {
  bars: Array<{
    barId: string;
    barName: string;
    barSlug: string;
    playsUsed: number;
    playsRemaining: number;
    playsLimit: number;
  }>;
  totalPlaysToday: number;
}

// ==================== FUNCIONES DEL SERVICIO ====================

/**
 * Obtener info pública del bar (sin auth).
 */
export async function getBarPublicInfo(
  slugOrCode: string
): Promise<BarPublicInfo> {
  const { data } = await api.get<BarPublicInfo>(
    `/game/bar/${slugOrCode}/public`
  );
  return data;
}

/**
 * Acceder al bar (requiere auth).
 * Retorna info del bar + jugadas restantes + pozo.
 */
export async function accessBar(
  slugOrCode: string
): Promise<BarAccessResponse> {
  const { data } = await api.get<BarAccessResponse>(
    `/game/bar/${slugOrCode}`
  );
  return data;
}

/**
 * Obtener símbolos del bar (globales + específicos, solo activos).
 */
export async function getBarSymbols(
  slugOrCode: string
): Promise<BarSymbolResponse[]> {
  const { data } = await api.get<BarSymbolResponse[]>(
    `/game/bar/${slugOrCode}/symbols`
  );
  return data;
}

/**
 * Ejecutar jugada gratuita.
 */
export async function playFree(
  barSlug: string,
  tableId?: string
): Promise<PlayResultResponse> {
  const { data } = await api.post<PlayResultResponse>("/game/play/free", {
    barSlug,
    tableId,
  });
  return data;
}

/**
 * Ejecutar jugada paga (premio local del bar).
 */
export async function playPaid(
  barSlug: string,
  tableId?: string
): Promise<PlayResultResponse> {
  const { data } = await api.post<PlayResultResponse>("/game/play/paid", {
    barSlug,
    tableId,
  });
  return data;
}

/**
 * Ejecutar jugada por el pozo global.
 */
export async function playPool(
  barSlug: string,
  tableId?: string
): Promise<PlayResultResponse> {
  const { data } = await api.post<PlayResultResponse>("/game/play/pool", {
    barSlug,
    tableId,
  });
  return data;
}

/**
 * Estado del pozo global.
 */
export async function getPoolStatus(): Promise<PoolStatusResponse> {
  const { data } = await api.get<PoolStatusResponse>("/game/pool/status");
  return data;
}

/**
 * Resumen de jugadas del día.
 */
export async function getDailySummary(): Promise<DailySummaryResponse> {
  const { data } = await api.get<DailySummaryResponse>(
    "/user-daily-plays/my-summary"
  );
  return data;
}
