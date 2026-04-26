// components/PoolPromoStrip.tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import { Zap, ChevronRight, Trophy } from "lucide-react";
import type { PrizeItem } from "@/services/prize.service";

interface PoolPromoStripProps {
  prizes: PrizeItem[];
  poolAmount: number;
  costPerPlay: number;
  onPlayPool: () => void;
  className?: string;
}

/**
 * Tira promocional del pozo global que aparece en la pantalla de jugadas gratis.
 *
 * Muestra los premios destacados en miniatura + monto del pozo +
 * CTA para que el usuario pase a jugar por el pozo global.
 *
 * No es agresivo: es una tira compacta que se integra con la UI,
 * pero lo suficientemente llamativa para generar interés.
 */
export function PoolPromoStrip({
  prizes,
  poolAmount,
  costPerPlay,
  onPlayPool,
  className,
}: PoolPromoStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filtrar premios destacados (max 6, priorizando jackpot)
  const featuredPrizes = prizes
    .filter((p) => p.isActive)
    .sort((a, b) => {
      if (a.type === "jackpot" && b.type !== "jackpot") return -1;
      if (a.type !== "jackpot" && b.type === "jackpot") return 1;
      return (b.value ?? 0) - (a.value ?? 0);
    })
    .slice(0, 6);

  if (featuredPrizes.length === 0 && poolAmount <= 0) return null;

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <button
        onClick={onPlayPool}
        className="group w-full rounded-xl overflow-hidden border border-primary/25 transition-all duration-300 hover:border-primary/40 active:scale-[0.99] text-left"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.04 160 / 0.95), oklch(0.18 0.05 160 / 0.95))",
          boxShadow: "0 2px 16px oklch(0.72 0.15 85 / 0.08)",
        }}
      >
        {/* Top row: label + pool amount */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 sm:px-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">
              Jugá por el pozo global
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-primary tabular-nums font-display">
              {formatCurrency(poolAmount)}
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          </div>
        </div>

        {/* Prize strip */}
        {featuredPrizes.length > 0 && (
          <div
            ref={scrollRef}
            className="flex gap-2 px-3 pb-2 sm:px-4 overflow-x-auto scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {featuredPrizes.map((prize) => (
              <MiniPrizeCard key={prize.id} prize={prize} />
            ))}

            {/* CTA card */}
            <div className="flex-shrink-0 flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5">
              <span className="text-[10px] font-semibold text-primary whitespace-nowrap">
                ¡y más!
              </span>
              <ChevronRight className="h-3 w-3 text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Bottom CTA bar */}
        <div
          className="flex items-center justify-center gap-2 py-2 transition-all duration-300"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.15 85 / 0.15), oklch(0.72 0.15 85 / 0.08))",
            borderTop: "1px solid oklch(0.72 0.15 85 / 0.15)",
          }}
        >
          <Trophy className="h-3 w-3 text-primary" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-primary/90">
            Ganá estos premios desde{" "}
            <span className="font-bold text-primary">
              {formatCurrency(costPerPlay)}
            </span>
          </span>
          <ChevronRight className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}

// ==================== MINI PRIZE CARD ====================

function MiniPrizeCard({ prize }: { prize: PrizeItem }) {
  const isJackpot = prize.type === "jackpot";

  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-center gap-2 rounded-lg px-2 py-1.5",
        isJackpot
          ? "bg-primary/10 border border-primary/25"
          : "bg-card/30 border border-border/30",
      )}
    >
      {/* Image or emoji */}
      <div
        className={cn(
          "w-7 h-7 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0",
          isJackpot ? "bg-primary/15" : "bg-muted/40",
        )}
      >
        {prize.imageUrl ? (
          <img
            src={prize.imageUrl}
            alt={prize.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            draggable={false}
          />
        ) : (
          <span className="text-sm leading-none select-none">
            {isJackpot ? "🏆" : "🎁"}
          </span>
        )}
      </div>

      {/* Name + value */}
      <div className="min-w-0 max-w-[80px]">
        <p
          className={cn(
            "text-[10px] font-semibold leading-tight truncate",
            isJackpot ? "text-primary" : "text-foreground/80",
          )}
        >
          {prize.name}
        </p>
        {prize.value != null && prize.value > 0 && (
          <p className="text-[9px] text-muted-foreground tabular-nums">
            {prize.value >= 1_000_000
              ? `Gs. ${(prize.value / 1_000_000).toFixed(1).replace(".0", "")}M`
              : prize.value >= 1_000
                ? `Gs. ${Math.floor(prize.value / 1_000)}k`
                : `Gs. ${prize.value}`}
          </p>
        )}
      </div>
    </div>
  );
}
