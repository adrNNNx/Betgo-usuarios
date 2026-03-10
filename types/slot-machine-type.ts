// components/slot-machine/types.ts

export interface SlotSymbol {
  id: string;
  label: string;
  /** The emoji, image URL, or React node to display */
  content: string;
  /** Optional multiplier value for this symbol */
  multiplier?: number;
}

export interface SlotMachineConfig {
  /** Number of reels to display (default: 5) */
  reelCount: number;
  /** Symbols that appear in the reels */
  symbols: SlotSymbol[];
  /** Title displayed above the machine */
  title: string;
  /** Subtitle displayed below the title */
  subtitle: string;
  /** Bar logo URL (optional) - if provided, shows logo instead of just title */
  barLogoUrl?: string | null;
  /** Current jackpot/pool amount */
  jackpotAmount: number;
  /** Currency label (e.g., "Gs.") */
  currency: string;
  /** Free spins remaining */
  freeSpins: number;
  /** Duration of spin animation in ms per reel (default: 2000) */
  spinDuration?: number;
  /** Callback when spin completes with final symbols */
  onSpinComplete?: (results: SlotSymbol[]) => void;
  /** Callback when spin starts */
  onSpinStart?: () => void;
  /** Whether the machine can spin */
  canSpin?: boolean;
}

export type SpinState = "idle" | "spinning" | "stopping" | "won";
