// store/useGameStore.ts
"use client";

import { create } from "zustand";
import {
  accessBar,
  playFree,
  playPaid,
  playPool,
  getPoolStatus,
  type BarAccessResponse,
  type PlayResultResponse,
  type BarSymbolResponse,
  getBarSymbols,
} from "@/services/game.service";
import { useAuthStore } from "./useAuthStore";

// ==================== TIPOS ====================

interface BarData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  freePlaysPerDay: number;
}

interface SessionData {
  playsRemaining: number;
  playsUsed: number;
  playsLimit: number;
  userBalance: number;
}

interface PoolData {
  currentAmount: number;
  costPerPlay: number;
}

type PlayType = "free" | "paid" | "pool";

interface GameState {
  // Datos del bar
  bar: BarData | null;
  session: SessionData | null;
  pool: PoolData | null;
  symbols: BarSymbolResponse[];

  // Estado del juego
  isLoadingBar: boolean;
  isPlaying: boolean;
  barError: string | null;
  lastResult: PlayResultResponse | null;

  // Acciones
  loadBar: (slug: string) => Promise<void>;
  loadSymbols: (slug: string) => Promise<void>;
  loadPool: () => Promise<void>;
  play: (type: PlayType, barSlug: string, tableId?: string) => Promise<PlayResultResponse>;
  clearResult: () => void;
  reset: () => void;
}

// ==================== STORE ====================

export const useGameStore = create<GameState>()((set, get) => ({
  bar: null,
  session: null,
  pool: null,
  symbols: [],
  isLoadingBar: false,
  isPlaying: false,
  barError: null,
  lastResult: null,

  /**
   * Cargar datos completos del bar (requiere auth).
   */
  loadBar: async (slug: string) => {
    try {
      set({ isLoadingBar: true, barError: null });

      const data = await accessBar(slug);

      set({
        bar: data.bar,
        session: data.session,
        pool: data.globalPool,
        isLoadingBar: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al acceder al bar";
      set({ isLoadingBar: false, barError: message });
      throw error;
    }
  },

  /**
   * Cargar símbolos del bar (globales + específicos).
   */
  loadSymbols: async (slug: string) => {
    try {
      const data = await getBarSymbols(slug);
      set({ symbols: data });
    } catch (error: any) {
      console.error("Error cargando símbolos:", error);
    }
  },

  /**
   * Cargar estado del pozo global.
   */
  loadPool: async () => {
    try {
      const data = await getPoolStatus();
      set({
        pool: {
          currentAmount: data.currentAmount,
          costPerPlay: data.costPerPlay,
        },
      });
    } catch (error: any) {
      console.error("Error cargando pozo:", error);
    }
  },

  /**
   * Ejecutar una jugada.
   * Actualiza el estado de sesión y balance del usuario automáticamente.
   */
  play: async (
    type: PlayType,
    barSlug: string,
    tableId?: string
  ): Promise<PlayResultResponse> => {
    try {
      set({ isPlaying: true });

      let result: PlayResultResponse;

      switch (type) {
        case "free":
          result = await playFree(barSlug, tableId);
          break;
        case "paid":
          result = await playPaid(barSlug, tableId);
          break;
        case "pool":
          result = await playPool(barSlug, tableId);
          break;
      }

      // Actualizar sesión con los datos de la respuesta
      set((state) => ({
        isPlaying: false,
        lastResult: result,
        session: state.session
          ? {
              ...state.session,
              playsRemaining: result.session.playsRemaining,
              playsUsed: result.session.playsUsed,
              userBalance: result.session.balance,
            }
          : null,
        pool:
          result.poolAmount !== undefined && state.pool
            ? { ...state.pool, currentAmount: result.poolAmount }
            : state.pool,
      }));

      // Sincronizar balance en el auth store
      useAuthStore.getState().updateBalance(result.session.balance);

      return result;
    } catch (error: any) {
      set({ isPlaying: false });
      throw error;
    }
  },

  clearResult: () => set({ lastResult: null }),

  reset: () =>
    set({
      bar: null,
      session: null,
      pool: null,
      symbols: [],
      isLoadingBar: false,
      isPlaying: false,
      barError: null,
      lastResult: null,
    }),
}));

// ==================== SELECTORES ====================

export const useBarData = () => useGameStore((s) => s.bar);
export const useSessionData = () => useGameStore((s) => s.session);
export const usePoolData = () => useGameStore((s) => s.pool);
export const useFreePlaysRemaining = () =>
  useGameStore((s) => s.session?.playsRemaining ?? 0);
export const useIsPlaying = () => useGameStore((s) => s.isPlaying);
export const useLastResult = () => useGameStore((s) => s.lastResult);
export const useBarSymbolsData = () => useGameStore((s) => s.symbols);
