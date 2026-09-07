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
  /**
   * Desde cuántos carriles iguales paga el símbolo (3, 4 o 5).
   * Opcional por compatibilidad: sin este campo la tabla de pagos no se muestra.
   */
  minMatchToWin?: number;
  /**
   * Premio que paga el símbolo. Los tres son `null` cuando no tiene —
   * incluidos los símbolos de pozo (`isJackpot`), que por invariante del
   * backend nunca tienen premio propio.
   */
  prizeName: string | null;
  prizeId: string | null;
  prizeValue: number | null;
}

/** Estados del retiro del pozo: pending_contact → in_review → paid. */
export type JackpotClaimStatus = "pending_contact" | "in_review" | "paid";

export interface PlayResultResponse {
  playId: string;
  symbols: string[];
  symbolDetails: Array<{ id: string; name: string; imageUrl: string }>;
  isWinner: boolean;
  /**
   * Repeticiones del símbolo más frecuente y cuál fue.
   * Hoy sólo vienen en `play/pool`; en free/paid se derivan contando `symbols[]`.
   */
  matchCount?: number;
  winningSymbolId?: string | null;
  /**
   * Presente SÓLO al ganar el pozo (junto con `prize.id === 'jackpot'`).
   * El monto NO se acredita al saldo: se retira coordinando con administración.
   * `contactHref` es null si el backend no tiene el WhatsApp configurado.
   */
  jackpot?: {
    folio: string;
    status: JackpotClaimStatus;
    amount: number;
    playedAt: string;
    contactHref: string | null;
  };
  prize: {
    id: string;
    name: string;
    type: string;
    value?: number;
    imageUrl?: string;
    claimCode?: string;
    claimQrCode?: string;
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
 * Para jugadas gratis y pagas.
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
 * Obtener símbolos globales (solo para el pozo global).
 * Solo retorna símbolos sin bar asociado (bar_id IS NULL).
 */
export async function getPoolSymbols(): Promise<BarSymbolResponse[]> {
  const { data } = await api.get<BarSymbolResponse[]>(
    "/game/pool/symbols"
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

// ==================== BANNERS ====================

export interface BannerItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  barId: string | null;
}

/**
 * Obtener banners activos (globales + del bar).
 * GET /banners/active?barId=xxx
 *
 * Endpoint público — retorna solo banners visibles
 * (activos, dentro de fechas configuradas).
 */
export async function getActiveBanners(
  barId?: string
): Promise<BannerItem[]> {
  const params = barId ? { barId } : {};
  const { data } = await api.get<BannerItem[]>("/banners/active", { params });
  return data;
}
