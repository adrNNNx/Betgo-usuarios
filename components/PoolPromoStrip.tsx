// components/PoolPromoStrip.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cdn } from "@/lib/cdn";
import { formatCurrency } from "@/lib/game-logic";
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

interface PoolPromoStripProps {
  prizes: PrizeItem[];
  poolAmount: number;
  costPerPlay: number;
  onPlayPool: () => void;
  className?: string;
}

/**
 * Tira promocional del pozo global con metáfora de "ticket dorado".
 *
 * Layout:
 *  ┌─────────────────────────────────────┐
 *  │  POZO GLOBAL  │  ESTO PODRÍA SER TUYO │
 *  │  Gs. 129M     │  [icon] Premio rotando │
 *  │  Desde 5k     │  · · · · · ·          │
 *  ├ - - - - - - - - - - - - - - - - - - ┤   ← perforación tipo ticket
 *  │  Premio · 12M   Premio · 70k   ...    │   ← marquee de TODOS los premios
 *  ├─────────────────────────────────────┤
 *  │       JUGAR POR EL POZO →           │   ← CTA dorado
 *  └─────────────────────────────────────┘
 *
 * Mobile: dos secciones apiladas (pozo arriba, premio abajo) separadas por dashed.
 * Desktop: dos columnas separadas por línea perforada vertical.
 */
export function PoolPromoStrip({
  prizes,
  poolAmount,
  costPerPlay,
  onPlayPool,
  className,
}: PoolPromoStripProps) {
  const [featured, setFeatured] = useState(0);
  const [paused, setPaused] = useState(false);

  // Filtrar y ordenar premios (jackpot primero, luego por valor)
  const sorted = prizes
    .filter((p) => p.isActive)
    .sort((a, b) => {
      if (a.type === "jackpot" && b.type !== "jackpot") return -1;
      if (a.type !== "jackpot" && b.type === "jackpot") return 1;
      return (b.value ?? 0) - (a.value ?? 0);
    });

  // Auto-rotación del premio destacado
  useEffect(() => {
    if (paused || sorted.length <= 1) return;
    const id = setInterval(() => {
      setFeatured((p) => (p + 1) % sorted.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused, sorted.length]);

  if (sorted.length === 0 && poolAmount <= 0) return null;

  const current = sorted[featured] ?? sorted[0];
  const tickerItems = [...sorted, ...sorted]; // duplicado para marquee infinito
  const durationSec = Math.max(sorted.length * 6, 24);

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <button
        onClick={onPlayPool}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="group relative w-full text-left transition-all duration-300 active:scale-[0.99]"
      >
        {/* Card principal */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.26 0.04 160) 0%, oklch(0.22 0.04 160) 100%)",
            border: "1px solid oklch(0.72 0.15 85 / 0.28)",
            boxShadow:
              "0 1px 0 oklch(1 0 0 / 0.04) inset, 0 0 0 1px oklch(0.72 0.15 85 / 0.04), 0 12px 36px oklch(0 0 0 / 0.4)",
          }}
        >
          {/* Notches superiores tipo ticket */}
          <Notch position="topleft" />
          <Notch position="topright" />

          {/* ============ SECCIÓN 1: POZO + PREMIO DESTACADO ============ */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr]">
            {/* Lado izquierdo: pozo */}
            <div className="px-5 pt-4 pb-3 sm:px-6 sm:py-5 border-b border-dashed border-primary/15 sm:border-b-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span
                  className="font-display text-[9px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "oklch(0.85 0.17 85 / 0.7)" }}
                >
                  Pozo Global
                </span>
              </div>
              <div
                className="font-display font-extrabold tabular-nums text-[28px] sm:text-[32px] leading-none mb-1"
                style={{
                  letterSpacing: "-0.03em",
                  background:
                    "linear-gradient(135deg, oklch(0.85 0.17 85) 0%, oklch(0.78 0.16 80) 50%, oklch(0.85 0.17 85) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {formatCompact(poolAmount)}
              </div>
              <div className="text-[10.5px] text-muted-foreground leading-snug">
                Jugadas desde{" "}
                <span className="font-semibold text-foreground/85">
                  {formatCompact(costPerPlay)}
                </span>
              </div>
            </div>

            {/* Divisor vertical perforado (solo desktop) */}
            <div
              className="hidden sm:block"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, oklch(0.72 0.15 85 / 0.25) 0 4px, transparent 4px 8px)",
                width: 1,
              }}
            />

            {/* Lado derecho: premio destacado rotando */}
            <div className="px-5 py-4 sm:px-6 sm:py-5 relative">
              <div
                className="font-display text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-2"
              >
                Participa por los siguiente premios
              </div>
              <div
                key={current?.id + "-" + featured}
                className="flex items-center gap-3 animate-pool-fade-up"
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
                        · Quedan {current.stock}
                      </span>
                    )}
                  </div>
                  <div className="font-display font-bold text-[16px] sm:text-[17px] leading-tight text-foreground/95 truncate">
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
                      Valuado en {formatCompact(current.value)}
                    </div>
                  )}
                </div>
              </div>

              {/* Dots indicador */}
              {sorted.length > 1 && (
                <div className="flex gap-[3px] mt-2.5">
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

          {/* ============ SECCIÓN 2: TICKER DE PREMIOS ============ */}
          <div
            className="relative overflow-hidden py-2.5"
            style={{ background: "oklch(0.2 0.05 160 / 0.4)" }}
          >
            {/* Fade left */}
            <div
              className="absolute inset-y-0 left-0 w-8 z-[2] pointer-events-none"
              style={{
                background: "linear-gradient(to right, oklch(0.22 0.04 160), transparent)",
              }}
            />
            {/* Fade right */}
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
                animation: `pool-marquee ${durationSec}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {tickerItems.map((prize, i) => (
                <TickerItem key={`${prize.id}-${i}`} prize={prize} />
              ))}
            </div>
          </div>

          {/* ============ CTA DORADO ============ */}
          <div
            className="flex items-center justify-center gap-2 py-3 px-4 transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.15 85 / 0.16), oklch(0.72 0.15 85 / 0.06) 50%, oklch(0.72 0.15 85 / 0.16))",
              borderTop: "1px solid oklch(0.72 0.15 85 / 0.22)",
            }}
          >
            <span
              className="font-body text-xs font-bold uppercase tracking-[0.04em]"
              style={{ color: "oklch(0.88 0.17 85)" }}
            >
              Ir al pozo global
            </span>
            <span
              className="font-display text-sm font-bold transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: "oklch(0.88 0.17 85)" }}
            >
              →
            </span>
          </div>
        </div>
      </button>

      {/* Animaciones locales */}
      <style jsx>{`
        @keyframes pool-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes pool-fade-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.animate-pool-fade-up) {
          animation: pool-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

/** Recorte circular tipo ticket (mismo color que el fondo de la página) */
function Notch({ position }: { position: "topleft" | "topright" | "midleft" | "midright" }) {
  const map: Record<typeof position, React.CSSProperties> = {
    topleft: { top: -7, left: -7 },
    topright: { top: -7, right: -7 },
    midleft: { top: "50%", left: -7, transform: "translateY(-50%)" },
    midright: { top: "50%", right: -7, transform: "translateY(-50%)" },
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

/** Icono del premio: imagen del backend o emoji fallback */
function PrizeIcon({ prize }: { prize: PrizeItem }) {
  const isJackpot = prize.type === "jackpot";
  return (
    <div
      className={cn(
        "w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0",
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
        <span className="text-2xl leading-none select-none">
          {getPrizeFallbackEmoji(prize)}
        </span>
      )}
    </div>
  );
}

/** Item del ticker inferior: bullet + nombre + valor */
function TickerItem({ prize }: { prize: PrizeItem }) {
  const isJackpot = prize.type === "jackpot";
  return (
    <div className="flex-shrink-0 flex items-center gap-2">
      <span
        className="w-1 h-1 rounded-full"
        style={{
          background: isJackpot
            ? "oklch(0.85 0.17 85)"
            : "oklch(0.55 0.01 160 / 0.7)",
        }}
      />
      <span className="font-body text-[11px] font-semibold text-foreground/85 whitespace-nowrap">
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
