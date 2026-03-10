// hooks/use-bar-symbols.ts
"use client";

import { useState, useEffect } from "react";
import type { SlotSymbol } from "@/types/slot-machine-type";
import { DEFAULT_SYMBOLS } from "@/components/slot-machine/symbols";
import { api } from "@/lib/api";

interface BarSymbolResponse {
  id: string;
  name: string;
  imageUrl: string;
  hasPrize: boolean;
}

/**
 * Hook para cargar símbolos del bar desde la API
 * Si el bar tiene símbolos configurados, los usa
 * Si no, usa los símbolos por defecto (emojis)
 */
export function useBarSymbols(barSlug: string | null) {
  const [symbols, setSymbols] = useState<SlotSymbol[]>(DEFAULT_SYMBOLS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCustomSymbols, setUsingCustomSymbols] = useState(false);

  useEffect(() => {
    // Si no hay barSlug, usar símbolos por defecto
    if (!barSlug) {
      setSymbols(DEFAULT_SYMBOLS);
      setLoading(false);
      setUsingCustomSymbols(false);
      return;
    }

    const fetchBarSymbols = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get<BarSymbolResponse[]>(
          `game/bar/${barSlug}/symbols`,
        );

        if (!data || data.length === 0) {
          console.warn(
            `El bar ${barSlug} no tiene símbolos configurados, usando símbolos por defecto`,
          );
          setSymbols(DEFAULT_SYMBOLS);
          setUsingCustomSymbols(false);
          return;
        }

        const transformedSymbols: SlotSymbol[] = data.map((symbol, index) => ({
          id: symbol.id,
          label: symbol.name,
          content: symbol.imageUrl || getDefaultEmoji(index),
          multiplier: symbol.hasPrize ? 10 : 2,
        }));
        setSymbols(transformedSymbols);
        setUsingCustomSymbols(true);
      } catch (err) {
        console.error("Error al cargar símbolos del bar:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setSymbols(DEFAULT_SYMBOLS);
        setUsingCustomSymbols(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBarSymbols();
  }, [barSlug]);

  return { symbols, loading, error, usingCustomSymbols };
}

/**
 * Obtener emoji por defecto según el índice
 * Fallback en caso de que no haya imageUrl
 */
function getDefaultEmoji(index: number): string {
  const emojis = ["🔔", "🍇", "7️⃣", "🍊", "🍒", "💎", "⭐", "🍋"];
  return emojis[index % emojis.length];
}
