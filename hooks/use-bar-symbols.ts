// hooks/use-bar-symbols.ts
"use client";

import { useMemo } from "react";
import type { SlotSymbol } from "@/types/slot-machine-type";
import { DEFAULT_SYMBOLS } from "@/components/slot-machine/symbols";
import { useBarSymbolsData } from "@/store/useGameStore";
import type { BarSymbolResponse } from "@/services/game.service";

/**
 * Emojis por defecto como fallback si no hay imageUrl.
 */
const FALLBACK_EMOJIS = ["🔔", "🍇", "7️⃣", "🍊", "🍒", "💎", "⭐", "🍋"];

/**
 * Transforma un BarSymbolResponse del backend en un SlotSymbol para el slot machine.
 */
function toSlotSymbol(symbol: BarSymbolResponse, index: number): SlotSymbol {
  return {
    id: symbol.id,
    label: symbol.name,
    content: symbol.imageUrl || FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length],
    multiplier: symbol.isJackpot ? 20 : symbol.hasPrize ? 10 : 2,
    weight: symbol.weight,
    isGlobal: symbol.isGlobal,
  };
}

/**
 * Hook para obtener los símbolos del bar ya transformados a SlotSymbol.
 *
 * Los símbolos vienen del gameStore (cargados vía loadSymbols).
 * Incluye los globales (sin bar_id) + los específicos del bar (con bar_id),
 * todos ya filtrados por is_active=true en el backend.
 *
 * Si no hay símbolos cargados, retorna los DEFAULT_SYMBOLS (emojis).
 */
export function useBarSymbols() {
  const rawSymbols = useBarSymbolsData();

  const { symbols, usingCustomSymbols, globalCount, barCount } = useMemo(() => {
    if (!rawSymbols || rawSymbols.length === 0) {
      return {
        symbols: DEFAULT_SYMBOLS,
        usingCustomSymbols: false,
        globalCount: 0,
        barCount: 0,
      };
    }

    const transformed = rawSymbols.map((s, i) => toSlotSymbol(s, i));
    const globalCount = rawSymbols.filter((s) => s.isGlobal).length;
    const barCount = rawSymbols.filter((s) => !s.isGlobal).length;

    return {
      symbols: transformed,
      usingCustomSymbols: true,
      globalCount,
      barCount,
    };
  }, [rawSymbols]);

  return { symbols, usingCustomSymbols, globalCount, barCount };
}

/**
 * Helper para mapear symbolDetails del server result a SlotSymbol[].
 * Busca cada símbolo por ID en el array de símbolos disponibles.
 * Si no lo encuentra, crea un SlotSymbol temporal con la info del server.
 */
export function mapServerResultToSlotSymbols(
  symbolDetails: Array<{ id: string; name: string; imageUrl: string }>,
  availableSymbols: SlotSymbol[]
): SlotSymbol[] {
  return symbolDetails.map((detail, index) => {
    const found = availableSymbols.find((s) => s.id === detail.id);
    if (found) return found;

    // Fallback: crear SlotSymbol temporal con la data del server
    return {
      id: detail.id,
      label: detail.name,
      content: detail.imageUrl || FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length],
      multiplier: 2,
    };
  });
}
