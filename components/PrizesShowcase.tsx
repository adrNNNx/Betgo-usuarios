// components/PrizesShowcase.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { cdn } from "@/lib/cdn";
import type { PrizeItem } from "@/services/prize.service";

// ============================================================
// HELPERS
// ============================================================

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return "Gs. " + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + "M";
  }
  if (value >= 1_000) return "Gs. " + Math.floor(value / 1_000) + "k";
  return "Gs. " + value.toLocaleString("es-PY");
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

// ============================================================
// PROPS
// ============================================================

interface PrizesShowcaseProps {
  prizes: PrizeItem[];
  className?: string;
}

/**
 * Showcase de premios visible mientras el usuario juega por el pozo global.
 *
 * Comparte el lenguaje visual del PoolPromoStrip ("ticket dorado"):
 *  - Card con borde dorado sutil y notches laterales
 *  - Premio destacado rotando arriba (lo que el usuario está disputando)
 *  - Ticker continuo abajo con TODOS los premios
 *
 * Diferencias con PoolPromoStrip:
 *  - No tiene CTA (el usuario YA está jugando)
 *  - Tono informativo, no vendedor: "Estás jugando por…"
 *  - Más compacto verticalmente
 */
export function PrizesShowcase({ prizes, className }: PrizesShowcaseProps) {
  const [featured, setFeatured] = useState(0);
  const [paused, setPaused] = useState(false);

  // Filtrar y ordenar (jackpot primero, luego por valor)
  const sorted = prizes
    .filter((p) => p.isActive)
    .sort((a, b) => {
      if (a.type === "jackpot" && b.type !== "jackpot") return -1;
      if (a.type !== "jackpot" && b.type === "jackpot") return 1;
      return (b.value ?? 0) - (a.value ?? 0);
    });

  // Auto-rotación
  useEffect(() => {
    if (paused || sorted.length <= 1) return;
    const id = setInterval(() => {
      setFeatured((p) => (p + 1) % sorted.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused, sorted.length]);

  if (sorted.length === 0) return null;

  const current = sorted[featured] ?? sorted[0];
  const tickerItems = [...sorted, ...sorted];
  const durationSec = Math.max(sorted.length * 6, 24);

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.26 0.04 160) 0%, oklch(0.22 0.04 160) 100%)",
          border: "1px solid oklch(0.72 0.15 85 / 0.28)",
          boxShadow:
            "0 1px 0 oklch(1 0 0 / 0.04) inset, 0 0 0 1px oklch(0.72 0.15 85 / 0.04), 0 12px 36px oklch(0 0 0 / 0.4)",
        }}
      >
        {/* Notches superiores */}
        <Notch position="topleft" />
        <Notch position="topright" />

        {/* ============ HEADER + PREMIO DESTACADO ============ */}
        <div className="px-5 pt-4 pb-3 sm:px-6 sm:py-4">
          {/* Label de contexto */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span
                className="font-display text-[9px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "oklch(0.85 0.17 85 / 0.7)" }}
              >
                Estás jugando por
              </span>
            </div>
            {sorted.length > 1 && (
              <span
                className="font-body text-[9px] font-medium uppercase tracking-[0.16em] tabular-nums"
                style={{ color: "oklch(0.55 0.01 160)" }}
              >
                {featured + 1} / {sorted.length}
              </span>
            )}
          </div>

          {/* Premio destacado */}
          <div
            key={current?.id + "-" + featured}
            className="flex items-center gap-3 sm:gap-4 animate-showcase-fade"
          >
            <PrizeIcon prize={current} />
            <div className="min-w-0 flex-1">
              <div
                className="font-display text-[8.5px] font-semibold uppercase tracking-[0.16em] mb-0.5"
                style={{
                  color:
                    current.type === "jackpot"
                      ? "oklch(0.85 0.17 85 / 0.9)"
                      : "oklch(0.55 0.01 160)",
                }}
              >
                {current.type === "jackpot" ? "Premio Global" : "Premio Local"}
                {current.stock != null && current.stock > 0 && current.stock <= 3 && (
                  <span className="ml-1.5 font-bold" style={{ color: "oklch(0.7 0.18 35)" }}>
                    {current.stock === 1 ? `· Queda 1` : `· Quedan ${current.stock}`}
                  </span>
                )}
              </div>
              <div className="font-display font-bold text-[16px] sm:text-[18px] leading-tight text-foreground/95 truncate">
                {current.name}
              </div>
              {current.value != null && current.value > 0 && (
                <div
                  className="font-display font-bold text-[13px] tabular-nums leading-tight mt-0.5"
                  style={{
                    letterSpacing: "-0.01em",
                    color:
                      current.type === "jackpot"
                        ? "oklch(0.85 0.17 85)"
                        : "oklch(0.78 0.03 85 / 0.7)",
                  }}
                >
                  {formatCompact(current.value)}
                </div>
              )}
            </div>
          </div>

          {/* Dots indicador */}
          {sorted.length > 1 && (
            <div className="flex gap-[3px] mt-3">
              {sorted.map((_, i) => (
                <span
                  key={i}
                  className="h-[3px] rounded-full transition-all duration-500"
                  style={{
                    width: i === featured ? 14 : 3,
                    background:
                      i === featured
                        ? "oklch(0.72 0.15 85)"
                        : "oklch(0.55 0.01 160 / 0.35)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ============ PERFORACIÓN ============ */}
        <div
          className="relative h-3.5"
          style={{
            background:
              "repeating-linear-gradient(to right, oklch(0.72 0.15 85 / 0.25) 0 5px, transparent 5px 10px)",
            backgroundPosition: "0 50%",
            backgroundSize: "100% 1px",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Notch position="midleft" />
          <Notch position="midright" />
        </div>

        {/* ============ TICKER DE TODOS LOS PREMIOS ============ */}
        <div
          className="relative overflow-hidden py-2.5"
          style={{ background: "oklch(0.2 0.05 160 / 0.4)" }}
        >
          <div
            className="absolute inset-y-0 left-0 w-8 z-[2] pointer-events-none"
            style={{
              background: "linear-gradient(to right, oklch(0.22 0.04 160), transparent)",
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-8 z-[2] pointer-events-none"
            style={{
              background: "linear-gradient(to left, oklch(0.22 0.04 160), transparent)",
            }}
          />

          <div
            className="flex gap-6 px-4"
            style={{
              width: "max-content",
              animation: `showcase-marquee ${durationSec}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {tickerItems.map((prize, i) => (
              <TickerItem
                key={`${prize.id}-${i}`}
                prize={prize}
                isCurrent={prize.id === current.id}
              />
            ))}
          </div>
        </div>

        {/* Notches inferiores (cierra la metáfora del ticket) */}
        <Notch position="bottomleft" />
        <Notch position="bottomright" />
      </div>

      {/* Animaciones */}
      <style jsx>{`
        @keyframes showcase-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes showcase-fade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.animate-showcase-fade) {
          animation: showcase-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

function Notch({
  position,
}: {
  position: "topleft" | "topright" | "midleft" | "midright" | "bottomleft" | "bottomright";
}) {
  const map: Record<typeof position, React.CSSProperties> = {
    topleft: { top: -7, left: -7 },
    topright: { top: -7, right: -7 },
    midleft: { top: "50%", left: -7, transform: "translateY(-50%)" },
    midright: { top: "50%", right: -7, transform: "translateY(-50%)" },
    bottomleft: { bottom: -7, left: -7 },
    bottomright: { bottom: -7, right: -7 },
  };
  return (
    <div
      className="absolute w-3.5 h-3.5 rounded-full z-[3]"
      style={{
        background: "var(--color-background, oklch(0.2 0.05 160))",
        ...map[position],
      }}
    />
  );
}

function PrizeIcon({ prize }: { prize: PrizeItem }) {
  const isJackpot = prize.type === "jackpot";
  return (
    <div
      className={cn(
        "w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0",
        isJackpot
          ? "bg-primary/15 ring-1 ring-primary/30"
          : "bg-secondary/40 ring-1 ring-border/50",
      )}
    >
      {prize.imageUrl ? (
        <img
          src={cdn(prize.imageUrl, 128)}
          alt={prize.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          draggable={false}
        />
      ) : (
        <span className="text-2xl sm:text-3xl leading-none select-none">
          {getPrizeFallbackEmoji(prize)}
        </span>
      )}
    </div>
  );
}

function TickerItem({ prize, isCurrent }: { prize: PrizeItem; isCurrent: boolean }) {
  const isJackpot = prize.type === "jackpot";
  return (
    <div
      className="flex-shrink-0 flex items-center gap-2 transition-opacity duration-500"
      style={{ opacity: isCurrent ? 1 : 0.7 }}
    >
      <span
        className="w-1 h-1 rounded-full"
        style={{
          background: isJackpot
            ? "oklch(0.85 0.17 85)"
            : "oklch(0.55 0.01 160 / 0.7)",
        }}
      />
      <span
        className={cn(
          "font-body text-[11px] whitespace-nowrap",
          isCurrent ? "font-bold text-foreground" : "font-semibold text-foreground/85",
        )}
      >
        {prize.name}
      </span>
      {prize.value != null && prize.value > 0 && (
        <span
          className="font-display text-[10.5px] font-bold tabular-nums whitespace-nowrap"
          style={{
            letterSpacing: "-0.01em",
            color: isJackpot
              ? "oklch(0.85 0.17 85 / 0.9)"
              : "oklch(0.55 0.01 160)",
          }}
        >
          {formatCompact(prize.value)}
        </span>
      )}
    </div>
  );
}
