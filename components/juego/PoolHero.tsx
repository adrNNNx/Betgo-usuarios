// implementacion/juego/PoolHero.tsx
"use client";

import { useEffect, useState } from "react";
import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import { formatCompact } from "./juego-theme";
import type { PrizeItem } from "@/services/prize.service";

interface PoolHeroProps {
  poolAmount: number;
  prizes: PrizeItem[];
  /** Carriles iguales que exige el pozo. Viene de `minMatchToWin` del símbolo jackpot. */
  minMatchToWin?: number;
  className?: string;
}

/**
 * Encabezado de la pantalla del pozo global: monto en vivo a la izquierda,
 * premio destacado rotando a la derecha, ticket perforado con todos los
 * premios abajo. Sustituye a PrizesShowcase en "playing-global".
 *
 * Cambio respecto de PrizesShowcase: el monto entra al card. Antes el monto
 * vivía en un badge chico dentro del SlotMachine y el card sólo mostraba
 * premios, así que la pantalla del pozo se parecía demasiado a la gratuita.
 *
 * El costo por jugada y el saldo NO van acá: ya viven pegados al botón, que
 * es donde se toma la decisión. Repetirlos arriba sólo diluye el monto.
 */
export function PoolHero({
  poolAmount,
  prizes,
  minMatchToWin = 5,
  className,
}: PoolHeroProps) {
  const [featured, setFeatured] = useState(0);
  const [paused, setPaused] = useState(false);

  const sorted = prizes
    .filter((p) => p.isActive)
    .sort((a, b) => {
      if (a.type === "jackpot" && b.type !== "jackpot") return -1;
      if (a.type !== "jackpot" && b.type === "jackpot") return 1;
      return (b.value ?? 0) - (a.value ?? 0);
    });

  useEffect(() => {
    if (paused || sorted.length <= 1) return;
    const id = setInterval(() => setFeatured((p) => (p + 1) % sorted.length), 3500);
    return () => clearInterval(id);
  }, [paused, sorted.length]);

  const current = sorted[featured] ?? sorted[0];
  const ticker = [...sorted, ...sorted];
  const durationSec = Math.max(sorted.length * 6, 24);

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="relative w-full overflow-hidden rounded-[19px]"
        style={{
          border: "1px solid oklch(0.72 0.15 85 / 0.4)",
          background:
            "radial-gradient(115% 95% at 22% -10%, oklch(0.72 0.15 85 / 0.20), transparent 62%), linear-gradient(to bottom, oklch(0.26 0.04 160), oklch(0.23 0.045 160))",
          boxShadow: "0 12px 40px oklch(0.72 0.15 85 / 0.13)",
        }}
      >
        <div className="grid grid-cols-[1.02fr_1px_0.98fr]">
          {/* ---- Monto en vivo ---- */}
          <div className="min-w-0 px-[13px] pb-[13px] pt-3.5">
            <div className="flex items-center gap-1.5">
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
            </div>

            <div
              className="mt-2 whitespace-nowrap font-display text-[22px] font-black leading-none tabular-nums"
              style={{
                letterSpacing: "-0.03em",
                background:
                  "linear-gradient(135deg, oklch(0.74 0.15 85), oklch(0.86 0.18 88), oklch(0.74 0.15 85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px oklch(0.72 0.15 85 / 0.3))",
              }}
            >
              {formatCurrency(poolAmount)}
            </div>

            <div className="mt-2.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-[5px] pr-[9px] text-[10px]"
              style={{
                border: "1px solid oklch(0.72 0.15 85 / 0.24)",
                background: "oklch(0.72 0.15 85 / 0.08)",
                color: "oklch(0.68 0.02 160)",
              }}
            >
              <span
                className="grid h-4 w-4 place-items-center rounded-full font-display text-[9.5px] font-extrabold"
                style={{
                  background: "oklch(0.72 0.15 85 / 0.22)",
                  color: "oklch(0.88 0.15 86)",
                }}
              >
                {minMatchToWin}
              </span>
              iguales se lo llevan
            </div>
          </div>

          <div
            style={{
              background:
                "repeating-linear-gradient(to bottom, oklch(0.72 0.15 85 / 0.28) 0 4px, transparent 4px 9px)",
            }}
          />

          {/* ---- Premio destacado ---- */}
          <div className="min-w-0 px-[13px] pb-[13px] pt-3.5">
            <div
              className="font-display text-[8.5px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "oklch(0.88 0.15 86)" }}
            >
              Estás jugando por
            </div>

            {current && (
              <div
                key={current.id + "-" + featured}
                className="mt-2 flex animate-hero-fade items-center gap-[9px]"
              >
                <div
                  className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-[11px] text-[21px]"
                  style={{
                    background: "oklch(0.72 0.15 85 / 0.13)",
                    border: "1px solid oklch(0.72 0.15 85 / 0.3)",
                  }}
                >
                  {current.imageUrl ? (
                    <img
                      src={cdn(current.imageUrl, 128)}
                      alt={current.name}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="leading-none">
                      {current.type === "jackpot" ? "🏆" : "🎁"}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className="font-display text-[8px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: "oklch(0.88 0.15 86)" }}
                  >
                    {current.type === "jackpot" ? "Premio global" : "Premio local"}
                  </div>
                  <div className="mt-[3px] truncate font-display text-[14px] font-extrabold leading-tight">
                    {current.name}
                  </div>
                  {current.value != null && current.value > 0 && (
                    <div
                      className="mt-0.5 font-display text-[10px] font-bold tabular-nums"
                      style={{ color: "oklch(0.86 0.15 86)" }}
                    >
                      {formatCompact(current.value)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {sorted.length > 1 && (
              <div className="mt-2 flex gap-[3px]">
                {sorted.map((_, i) => (
                  <span
                    key={i}
                    className="h-[3px] rounded-full transition-all duration-500"
                    style={{
                      width: i === featured ? 15 : 3,
                      background:
                        i === featured
                          ? "oklch(0.72 0.15 85)"
                          : "oklch(0.55 0.01 160 / 0.4)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---- Perforación ---- */}
        <div
          className="relative h-3"
          style={{
            background:
              "repeating-linear-gradient(to right, oklch(0.72 0.15 85 / 0.26) 0 5px, transparent 5px 10px) 0 50% / 100% 1px no-repeat",
          }}
        >
          <span
            className="absolute -left-[7px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full"
            style={{ background: "oklch(0.2 0.05 160)" }}
          />
          <span
            className="absolute -right-[7px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full"
            style={{ background: "oklch(0.2 0.05 160)" }}
          />
        </div>

        {/* ---- Ticker de todos los premios ---- */}
        <div
          className="relative overflow-hidden py-2"
          style={{ background: "oklch(0.2 0.05 160 / 0.45)" }}
        >
          <div
            className="flex w-max animate-hero-marquee gap-[22px] pl-3.5"
            style={{
              ["--marquee-duration" as string]: `${durationSec}s`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {ticker.map((prize, i) => (
              <span
                key={`${prize.id}-${i}`}
                className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-[10.5px] font-semibold text-foreground/85"
              >
                <span
                  className="h-[3px] w-[3px] rounded-full"
                  style={{ background: "oklch(0.85 0.17 85)" }}
                />
                {prize.name}
                {prize.value != null && prize.value > 0 && (
                  <b className="font-display text-[10px] font-bold tabular-nums text-muted-foreground">
                    {formatCompact(prize.value)}
                  </b>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
