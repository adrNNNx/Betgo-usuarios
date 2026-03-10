// components/slot-machine/symbols.ts

import type { SlotSymbol } from "../../types/slot-machine-type";

export const DEFAULT_SYMBOLS: SlotSymbol[] = [
  { id: "bell", label: "Campana", content: "🔔", multiplier: 2 },
  { id: "grape", label: "Uva", content: "🍇", multiplier: 3 },
  { id: "seven", label: "Siete", content: "7️⃣", multiplier: 10 },
  { id: "orange", label: "Naranja", content: "🍊", multiplier: 2 },
  { id: "cherry", label: "Cereza", content: "🍒", multiplier: 5 },
  { id: "diamond", label: "Diamante", content: "💎", multiplier: 15 },
  { id: "star", label: "Estrella", content: "⭐", multiplier: 8 },
  { id: "lemon", label: "Limon", content: "🍋", multiplier: 1 },
];

/**
 * Get a random symbol from the symbols array
 */
export function getRandomSymbol(symbols: SlotSymbol[]): SlotSymbol {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

/**
 * Generate a strip of random symbols for a reel
 */
export function generateReelStrip(
  symbols: SlotSymbol[],
  length: number,
): SlotSymbol[] {
  return Array.from({ length }, () => getRandomSymbol(symbols));
}

/**
 * Check if there's a win in the results
 * Returns: { isWin: boolean, matchCount: number, symbol: matched symbol or null }
 */
export function checkWin(results: SlotSymbol[]): {
  isWin: boolean;
  matchCount: number;
  symbol: SlotSymbol | null;
} {
  if (results.length === 0)
    return { isWin: false, matchCount: 0, symbol: null };

  const counts: Record<string, number> = {};
  let maxCount = 0;
  let maxSymbol: SlotSymbol | null = null;

  for (const s of results) {
    counts[s.id] = (counts[s.id] || 0) + 1;
    if (counts[s.id] > maxCount) {
      maxCount = counts[s.id];
      maxSymbol = s;
    }
  }

  return {
    isWin: maxCount >= 3, // Need at least 3 matching symbols to win
    matchCount: maxCount,
    symbol: maxSymbol,
  };
}
