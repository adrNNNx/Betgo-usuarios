// lib/game-logic.ts

import { Symbol, SymbolType, GameResult } from "@/types/game";

/**
 * Símbolos de ejemplo para el juego
 */
export const DEFAULT_SYMBOLS: Symbol[] = [
  {
    id: "seven",
    name: "Seven",
    type: "seven",
    image: "🎰",
    weight: 5,
  },
  {
    id: "bar",
    name: "BAR",
    type: "bar",
    image: "📊",
    weight: 10,
  },
  {
    id: "bell",
    name: "Bell",
    type: "bell",
    image: "🔔",
    weight: 15,
  },
  {
    id: "orange",
    name: "Orange",
    type: "orange",
    image: "🍊",
    weight: 20,
  },
  {
    id: "cherry",
    name: "Cherry",
    type: "cherry",
    image: "🍒",
    weight: 20,
  },
  {
    id: "lemon",
    name: "Lemon",
    type: "lemon",
    image: "🍋",
    weight: 20,
  },
  {
    id: "grape",
    name: "Grape",
    type: "grape",
    image: "🍇",
    weight: 10,
  },
];

/**
 * Selecciona un símbolo aleatorio basado en los pesos
 */
export function selectRandomSymbol(symbols: Symbol[]): SymbolType {
  const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const symbol of symbols) {
    random -= symbol.weight;
    if (random <= 0) {
      return symbol.type;
    }
  }

  return symbols[0].type;
}

/**
 * Genera un resultado de slot machine
 */
export function generateSlotResult(symbols: Symbol[]): SymbolType[] {
  return Array.from({ length: 5 }, () => selectRandomSymbol(symbols));
}

/**
 * Verifica si hay una combinación ganadora
 */
export function checkWin(result: SymbolType[]): boolean {
  // Todos los símbolos deben ser iguales
  return result.every((symbol) => symbol === result[0]);
}

/**
 * Calcula el tiempo de animación para cada carril
 * Los carriles se detienen en secuencia para efecto dramático
 */
export function getReelStopTimes(baseTime: number = 2000): number[] {
  return [
    baseTime,
    baseTime + 300,
    baseTime + 600,
    baseTime + 900,
    baseTime + 1200,
  ];
}

/**
 * Formatea cantidad en guaraníes
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("PYG", "Gs.");
}

/**
 * Simula una tirada del servidor (en producción esto vendría del backend)
 */
export async function simulateSpin(
  mode: "free" | "global-pot",
  userBalance: number,
  potAmount: number,
  spinCost: number,
): Promise<GameResult> {
  // Simular delay del servidor
  await new Promise((resolve) => setTimeout(resolve, 500));

  const symbols = generateSlotResult(DEFAULT_SYMBOLS);
  const isWin = checkWin(symbols);

  // Calcular nuevo saldo
  let newBalance = userBalance;
  if (mode === "global-pot") {
    newBalance -= spinCost;
  }

  // Calcular nuevo pozo
  let newPotAmount = potAmount;
  if (mode === "global-pot") {
    // 30% va al pozo (según configuración por defecto)
    newPotAmount += spinCost * 0.3;
  }

  // Si ganó, dar el premio
  let prize = undefined;
  if (isWin && mode === "global-pot") {
    prize = {
      id: "jackpot",
      name: "Pozo Global",
      description: `¡Ganaste el pozo global de ${formatCurrency(potAmount)}!`,
      type: "jackpot" as const,
      value: potAmount,
      stock: 1,
      isActive: true,
    };
    newPotAmount = 0; // El pozo se reinicia
  } else if (isWin && mode === "free") {
    prize = {
      id: "free-drink",
      name: "Trago Gratis",
      description: "¡Ganaste un trago gratis!",
      type: "local" as const,
      stock: 0,
      isActive: true,
    };
  }

  return {
    symbols,
    isWin,
    prize,
    newBalance,
    newPotAmount,
  };
}

/**
 * Genera símbolos aleatorios para el efecto de spinning
 */
export function generateSpinningSymbols(count: number): SymbolType[] {
  const allTypes: SymbolType[] = [
    "seven",
    "bar",
    "bell",
    "orange",
    "cherry",
    "lemon",
    "grape",
  ];
  return Array.from(
    { length: count },
    () => allTypes[Math.floor(Math.random() * allTypes.length)],
  );
}
