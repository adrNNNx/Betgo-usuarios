// components/PrizesShowcase.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PrizeItem } from "@/services/prize.service";

// ==================== HELPERS ====================

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `Gs. ${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }
  if (value >= 1_000) {
    return `Gs. ${(value / 1_000).toFixed(0)}k`;
  }
  return `Gs. ${value.toLocaleString("es-PY")}`;
}

function getPrizeFallbackEmoji(prize: PrizeItem): string {
  if (prize.type === "jackpot") return "🏆";
  const name = prize.name.toLowerCase();
  if (name.includes("cerveza") || name.includes("beer") || name.includes("chop")) return "🍺";
  if (name.includes("trago") || name.includes("copa") || name.includes("drink")) return "🍹";
  if (name.includes("pizza") || name.includes("comida") || name.includes("food")) return "🍕";
  if (name.includes("iphone") || name.includes("celular") || name.includes("phone")) return "📱";
  if (name.includes("viaje") || name.includes("trip") || name.includes("vuelo")) return "✈️";
  if (name.includes("efectivo") || name.includes("dinero") || name.includes("cash")) return "💵";
  return "🎁";
}

// ==================== PRIZE CARD ====================

interface PrizeCardProps {
  prize: PrizeItem;
  index: number;
}

function PrizeCard({ prize, index }: PrizeCardProps) {
  const isJackpot = prize.type === "jackpot";
  const fallback = getPrizeFallbackEmoji(prize);

  return (
    <div
      className={cn(
        "relative flex-shrink-0 flex flex-col items-center gap-1.5",
        "w-[108px] sm:w-[120px] px-2 py-3 rounded-xl",
        isJackpot
          ? "bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/40"
          : "bg-gradient-to-b from-card/80 to-card/40 border border-border/40",
        "backdrop-blur-sm",
        "animate-fade-in-up",
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      {/* Badge tipo */}
      <div
        className={cn(
          "absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5",
          "text-[8px] font-bold uppercase tracking-wider leading-none",
          isJackpot
            ? "bg-primary/30 text-primary"
            : "bg-secondary/60 text-muted-foreground",
        )}
      >
        {isJackpot ? "global" : "local"}
      </div>

      {/* Imagen o emoji fallback */}
      <div
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden",
          "flex items-center justify-center flex-shrink-0",
          isJackpot
            ? "bg-primary/10 ring-1 ring-primary/30"
            : "bg-secondary/40 ring-1 ring-border/30",
        )}
      >
        {prize.imageUrl ? (
          <img
            src={prize.imageUrl}
            alt={prize.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="text-2xl sm:text-3xl leading-none select-none">
            {fallback}
          </span>
        )}
      </div>

      {/* Nombre */}
      <p
        className={cn(
          "text-[11px] sm:text-xs font-semibold text-center leading-tight line-clamp-2 w-full",
          isJackpot ? "text-primary" : "text-foreground/90",
        )}
      >
        {prize.name}
      </p>

      {/* Zona inferior — altura fija para que todas las cards sean iguales */}
      <div className="flex flex-col items-center gap-1 min-h-7 justify-center w-full">
        {prize.value != null && prize.value > 0 && (
          <span
            className={cn(
              "text-[10px] font-bold tabular-nums",
              isJackpot ? "text-primary/80" : "text-muted-foreground",
            )}
          >
            {formatValue(prize.value)}
          </span>
        )}

        {prize.stock != null && prize.stock > 0 && prize.stock <= 5 && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[9px] font-semibold",
              prize.stock <= 3 ? "text-primary" : "text-foreground/70",
            )}
          >
            {prize.stock === 1 && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse"
                style={{ boxShadow: "0 0 6px var(--color-primary)" }}
              />
            )}
            {prize.stock === 1 ? "¡Solo 1!" : `Quedan ${prize.stock}`}
          </span>
        )}

        {/* Descripción como fallback cuando no hay valor ni stock visible */}
        {(prize.value == null || prize.value === 0) &&
          (prize.stock == null || prize.stock === 0 || prize.stock > 5) &&
          prize.description && (
            <p className="text-[9px] text-muted-foreground/70 text-center leading-tight line-clamp-3 w-full px-1">
              {prize.description}
            </p>
          )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

interface PrizesShowcaseProps {
  prizes: PrizeItem[];
  className?: string;
}

/**
 * Strip de premios con marquee CSS infinito y suave.
 * - Mobile: ~108px por card, caben ~3 a la vez.
 * - Desktop (sm+): ~120px por card, caben más a la vez.
 * - Pausa en hover/touch.
 * - Sin scroll JS — usa translateX(-50%) sobre una lista duplicada.
 */
export function PrizesShowcase({ prizes, className }: PrizesShowcaseProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (prizes.length === 0) return null;

  // Con 3 o menos items no hay sentido en animar — se muestran estáticos centrados.
  const shouldAnimate = prizes.length > 3;

  // Duración: ~128px por item (card + gap) a 32px/s ≈ 4 s/item.
  // El track tiene 2x items y translateX(-50%) recorre exactamente 1x.
  const durationSec = prizes.length * 4;

  const items = shouldAnimate ? [...prizes, ...prizes] : prizes;

  return (
    <div className={cn("w-full max-w-2xl relative", className)}>
      {/* Fade izquierdo — sobre el header y el track */}
      <div
        className="absolute inset-y-0 left-0 w-8 sm:w-10 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, var(--color-background), transparent)" }}
      />
      {/* Fade derecho */}
      <div
        className="absolute inset-y-0 right-0 w-8 sm:w-10 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, var(--color-background), transparent)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-4 h-px bg-primary/40" />
        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">
          También jugás por
        </p>
        <div className="flex-1 h-px bg-linear-to-r from-primary/20 to-transparent" />
      </div>

      {/* Marquee wrapper — solo overflow-hidden, sin fades internos */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Track animado */}
        <div
          className={cn(
            "flex gap-2 px-1 pb-1",
            // Cuando no hay suficientes items mostramos estáticos
            !shouldAnimate && "justify-center flex-wrap",
          )}
          style={
            shouldAnimate
              ? {
                  // width: max-content para que el flex no haga wrap
                  width: "max-content",
                  animationName: "marquee",
                  animationDuration: `${durationSec}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationPlayState: isPaused ? "paused" : "running",
                }
              : undefined
          }
        >
          {items.map((prize, index) => (
            <PrizeCard
              key={`${prize.id}-${index}`}
              prize={prize}
              index={index % prizes.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
