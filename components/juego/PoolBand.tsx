// implementacion/juego/PoolBand.tsx
"use client";

import { formatCurrency } from "@/lib/game-logic";
import { cn } from "@/lib/utils";

interface PoolBandProps {
  poolAmount: number;
  costPerPlay: number;
  /** Cuántos premios hay en juego (para el subtítulo). Opcional. */
  prizeCount?: number;
  onPlayPool: () => void;
  className?: string;
}

/**
 * Banda compacta del pozo global — vive arriba de todo en la pantalla de
 * jugadas gratuitas. Es la ÚNICA pieza dorada de esa pantalla: por contraste
 * con el verde del resto, se lee como "otro juego, más grande".
 *
 * Reemplaza a PoolPromoStrip dentro de "playing-free": el strip completo
 * (con ticker y premio rotando) compite con la máquina y empuja el juego
 * fuera de pantalla. Acá el trabajo es un monto grande, un motivo y un botón.
 */
export function PoolBand({
  poolAmount,
  costPerPlay,
  prizeCount,
  onPlayPool,
  className,
}: PoolBandProps) {
  if (poolAmount <= 0) return null;

  return (
    <button
      onClick={onPlayPool}
      className={cn(
        "group relative flex w-full max-w-2xl items-center gap-3 overflow-hidden rounded-[13px] px-3 py-2.5 pl-[13px] text-left transition-transform active:scale-[0.99]",
        className,
      )}
      style={{
        border: "1px solid oklch(0.72 0.15 85 / 0.34)",
        background:
          "linear-gradient(100deg, oklch(0.72 0.15 85 / 0.13), oklch(0.26 0.04 160) 70%)",
      }}
    >
      {/* Brillo que recorre la banda: la mantiene viva sin animar el monto */}
      <span
        className="pointer-events-none absolute inset-0 animate-pool-sheen"
        style={{
          background:
            "linear-gradient(100deg, transparent 38%, oklch(0.85 0.14 85 / 0.14) 50%, transparent 62%)",
        }}
      />

      <span className="relative min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span
            className="font-display text-[8.5px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "oklch(0.88 0.15 86)" }}
          >
            Pozo global
          </span>
        </span>

        <span
          className="mt-[3px] block font-display text-[19px] font-extrabold tabular-nums leading-none"
          style={{ letterSpacing: "-0.02em", color: "oklch(0.84 0.17 86)" }}
        >
          {formatCurrency(poolAmount)}
        </span>

        <span className="mt-[3px] block text-[10.5px] leading-snug text-muted-foreground">
          Jugadas desde {formatCurrency(costPerPlay)}
          {prizeCount ? ` · ${prizeCount} premios en juego` : null}
        </span>
      </span>

      <span
        className="relative flex h-[34px] flex-none items-center gap-1.5 rounded-[10px] px-[13px] font-display text-[11.5px] font-extrabold uppercase tracking-[0.04em]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.76 0.16 88), oklch(0.68 0.15 82))",
          color: "oklch(0.2 0.05 160)",
          boxShadow: "0 4px 14px oklch(0.72 0.15 85 / 0.28)",
        }}
      >
        Jugar
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </span>

    </button>
  );
}
