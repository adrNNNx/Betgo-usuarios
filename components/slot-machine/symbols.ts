// components/slot-machine/symbols.ts

import type { SlotSymbol } from "../../types/slot-machine-type";

/**
 * Símbolos por defecto (emojis) como fallback cuando
 * el bar no tiene símbolos configurados en el backend.
 */
export const DEFAULT_SYMBOLS: SlotSymbol[] = [
  { id: "bell", label: "Campana", content: "🔔", multiplier: 2, weight: 100 },
  { id: "grape", label: "Uva", content: "🍇", multiplier: 3, weight: 100 },
  { id: "seven", label: "Siete", content: "7️⃣", multiplier: 10, weight: 50 },
  { id: "orange", label: "Naranja", content: "🍊", multiplier: 2, weight: 100 },
  { id: "cherry", label: "Cereza", content: "🍒", multiplier: 5, weight: 80 },
  { id: "diamond", label: "Diamante", content: "💎", multiplier: 15, weight: 30 },
  { id: "star", label: "Estrella", content: "⭐", multiplier: 8, weight: 60 },
  { id: "lemon", label: "Limon", content: "🍋", multiplier: 1, weight: 100 },
];

/**
 * Seleccionar un símbolo aleatorio usando los pesos como probabilidad.
 * Si los símbolos no tienen peso, selecciona uniformemente.
 *
 * Un símbolo con weight=200 aparece el doble de veces que uno con weight=100.
 */
export function getRandomSymbol(symbols: SlotSymbol[]): SlotSymbol {
  // Si algún símbolo tiene peso, usar selección ponderada
  const hasWeights = symbols.some((s) => s.weight && s.weight > 0);

  if (hasWeights) {
    const totalWeight = symbols.reduce((sum, s) => sum + (s.weight ?? 100), 0);
    let random = Math.random() * totalWeight;

    for (const symbol of symbols) {
      random -= symbol.weight ?? 100;
      if (random <= 0) {
        return symbol;
      }
    }
  }

  // Fallback: selección uniforme
  return symbols[Math.floor(Math.random() * symbols.length)];
}

/**
 * Generar una tira de símbolos aleatorios para un reel.
 * Usado durante la animación de giro.
 */
export function generateReelStrip(
  symbols: SlotSymbol[],
  length: number
): SlotSymbol[] {
  return Array.from({ length }, () => getRandomSymbol(symbols));
}

/**
 * Símbolo más repetido de la tirada y cuántas veces salió.
 *
 * Con matchCount >= 3 el símbolo más repetido es siempre único
 * (en 5 carriles no puede haber dos símbolos con 3+ repeticiones),
 * así que no hay empates que desambiguar en los casos que pagan.
 */
export function topMatch<T extends { id: string }>(
  results: T[]
): { matchCount: number; symbol: T | null } {
  const counts: Record<string, number> = {};
  let matchCount = 0;
  let symbol: T | null = null;

  for (const s of results) {
    counts[s.id] = (counts[s.id] || 0) + 1;
    if (counts[s.id] > matchCount) {
      matchCount = counts[s.id];
      symbol = s;
    }
  }

  return { matchCount, symbol };
}

/**
 * Verificar si hay una victoria en los resultados.
 * Cada símbolo paga desde su propio umbral (minMatchToWin).
 *
 * Solo se usa como fallback en modo demo: cuando hay respuesta del
 * servidor, `isWinner` es la autoridad (el cliente no conoce el stock).
 */
export function checkWin(results: SlotSymbol[]): {
  isWin: boolean;
  matchCount: number;
  symbol: SlotSymbol | null;
} {
  const { matchCount, symbol } = topMatch(results);

  return {
    // ponytail: sin minMatchToWin (símbolos demo) se exige la tirada completa
    isWin: symbol !== null && matchCount >= (symbol.minMatchToWin ?? results.length),
    matchCount,
    symbol,
  };
}
