// types/slot-machine-type.ts

export interface SlotSymbol {
  id: string;
  label: string;
  /** Emoji, image URL, or React node to display */
  content: string;
  /** Multiplier value for this symbol */
  multiplier?: number;
  /** Probability weight (from backend). Higher = more frequent */
  weight?: number;
  /** Whether this is a global symbol (shared across all bars) */
  isGlobal?: boolean;
}

export interface SlotMachineConfig {
  /** Number of reels (default: 5) */
  reelCount: number;
  /** Symbols available in the reels */
  symbols: SlotSymbol[];
  /** Title displayed above the machine */
  title: string;
  /** Subtitle displayed below the title */
  subtitle: string;
  /** Bar logo URL */
  barLogoUrl?: string | null;
  /** Current jackpot/pool amount */
  jackpotAmount: number;
  /** Currency label */
  currency: string;
  /** Free spins remaining */
  freeSpins: number;
  /** Duration of spin animation per reel in ms */
  spinDuration?: number;
  /** Callback when all reels stop */
  onSpinComplete?: (results: SlotSymbol[]) => void;
  /** Callback when spin starts */
  onSpinStart?: () => void;
  /** Whether the machine can spin */
  canSpin?: boolean;
}

export type SpinState = "idle" | "spinning" | "stopping" | "won";
