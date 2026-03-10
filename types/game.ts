// types/game.ts

export type SymbolType = 
  | 'seven'
  | 'bar'
  | 'bell'
  | 'orange'
  | 'cherry'
  | 'lemon'
  | 'grape'
  | 'sponsor';

export interface Symbol {
  id: string;
  name: string;
  type: SymbolType;
  image: string;
  weight: number; // Probabilidad
  prizeId?: string; // Premio asociado si todos los símbolos coinciden
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  type: 'local' | 'jackpot';
  barId?: string; // Solo para premios locales
  value?: number;
  stock: number; // 0 = ilimitado
  isActive: boolean;
}

export interface Bar {
  id: string;
  name: string;
  slug: string;
  location?: string;
  logoUrl?: string;
  freeSpinsPerDay: number;
  distribution: {
    bar: number;
    pot: number;
    company: number;
  };
  isActive: boolean;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  balance: number;
  isAuthenticated: boolean;
  freeSpinsUsed: number;
  freeSpinsAvailable: number;
}

export interface GameResult {
  symbols: SymbolType[];
  isWin: boolean;
  prize?: Prize;
  newBalance: number;
  newPotAmount: number;
}

export interface GameState {
  isSpinning: boolean;
  currentResult: GameResult | null;
  potAmount: number;
  spinCost: number;
  user: User;
  bar: Bar;
}

export type GameMode = 'free' | 'global-pot';

export interface SpinRequest {
  userId?: string;
  barId: string;
  mode: GameMode;
}

export interface SpinResponse {
  success: boolean;
  result: GameResult;
  message?: string;
}
