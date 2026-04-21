// components/PrizesShowcase.tsx
"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";
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

// Emoji fallback por tipo de premio cuando no hay imagen
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
        // Layout
        "relative flex-shrink-0 flex flex-col items-center gap-1.5",
        "w-[108px] sm:w-[120px] px-2 py-3 rounded-xl",
        // Background — diferente para jackpot vs local
        isJackpot
          ? "bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/40"
          : "bg-gradient-to-b from-card/80 to-card/40 border border-border/40",
        "backdrop-blur-sm",
        // Animación de entrada escalonada
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
        {isJackpot ? "jackpot" : "local"}
      </div>

      {/* Imagen o emoji fallback */}
      <div
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden",
          "flex items-center justify-center",
          "flex-shrink-0",
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

      {/* Valor opcional */}
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

      {/* Stock limitado */}
      {prize.stock != null && prize.stock > 0 && prize.stock <= 5 && (
        <span className="text-[9px] text-destructive/80 font-medium">
          ¡Quedan {prize.stock}!
        </span>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

interface PrizesShowcaseProps {
  prizes: PrizeItem[];
  className?: string;
}

/**
 * Strip horizontal de premios disponibles para el pozo global.
 * Muestra jackpots globales + premios locales del bar.
 *
 * - Auto-scroll horizontal suave
 * - Pausa en hover/touch
 * - No renderiza nada si no hay premios
 * - Mobile-first: scroll horizontal nativo como fallback
 */
export function PrizesShowcase({ prizes, className }: PrizesShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animFrameRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Velocidad de auto-scroll en px/segundo
  const SCROLL_SPEED = 28;

  // ==================== AUTO-SCROLL SUAVE ====================
  const tick = useCallback(
    (timestamp: number) => {
      const el = scrollRef.current;
      if (!el || isPaused) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Avanzar el scroll
      el.scrollLeft += SCROLL_SPEED * delta;

      // Si llegamos al final, volvemos al inicio silenciosamente
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollLeft = 0;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [isPaused]
  );

  useEffect(() => {
    if (prizes.length <= 3) return; // no hay suficientes para scroll
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tick, prizes.length]);

  // ==================== NO PRIZES ====================
  if (prizes.length === 0) return null;

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-4 h-px bg-primary/40" />
        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">
          También jugás por
        </p>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
      </div>

      {/* Cards scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-2 overflow-x-auto overflow-y-hidden",
          // Ocultar scrollbar visualmente pero mantener funcionalidad
          "scrollbar-none",
          "[&::-webkit-scrollbar]:hidden",
          "[-ms-overflow-style:none]",
          "[scrollbar-width:none]",
          // Padding lateral para que las tarjetas no queden pegadas al borde
          "px-1 pb-1",
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Duplicamos las tarjetas para el loop infinito cuando hay muchos premios */}
        {(prizes.length > 3 ? [...prizes, ...prizes] : prizes).map(
          (prize, index) => (
            <PrizeCard
              key={`${prize.id}-${index}`}
              prize={prize}
              index={index % prizes.length}
            />
          )
        )}
      </div>

      {/* Fade out en los bordes — solo decorativo */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-background))",
        }}
      />
    </div>
  );
}
