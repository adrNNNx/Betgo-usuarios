// components/WelcomeScreen.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { cdn } from "@/lib/cdn";
import { formatCurrency } from "@/lib/game-logic";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Zap,
  ChevronRight,
  Wallet,
  Clock,
  Banknote,
  Gift,
  Users,
  ShieldCheck,
} from "lucide-react";
import { BetgoFooter } from "@/components/BetgoFooter";
import { BannerCarousel } from "@/components/BannerCarousel";
import type { BannerItem } from "@/services/game.service";
import type { PrizeItem } from "@/services/prize.service";

interface Bar {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  freeSpinsPerDay: number;
  isActive: boolean;
}

interface PoolInfo {
  currentAmount: number;
  costPerPlay: number;
  activePlayers?: number;
}

interface WelcomeScreenProps {
  bar: Bar;
  freeSpinsAvailable: number;
  pool: PoolInfo;
  userBalance: number;
  banners?: BannerItem[];
  /** Premios activos del pozo — para mostrar el carrusel */
  poolPrizes?: PrizeItem[];
  onPlayClick: () => void;
  onPlayPoolClick: () => void;
  onLoadBalanceClick: () => void;
}

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
  if (name.includes("cerveza") || name.includes("chop")) return "🍺";
  if (name.includes("trago") || name.includes("copa")) return "🍹";
  if (name.includes("pizza") || name.includes("comida")) return "🍕";
  if (name.includes("iphone") || name.includes("celular")) return "📱";
  if (name.includes("viaje") || name.includes("vuelo")) return "✈️";
  if (name.includes("picada")) return "🧀";
  return "🎁";
}

// ============================================================
// POOL CARD — Variante B: cinematográfica con micro-carrusel
// ============================================================

function PoolCard({
  pool,
  poolPrizes = [],
  canPlayPool,
  onPlayPoolClick,
}: {
  pool: PoolInfo;
  poolPrizes?: PrizeItem[];
  canPlayPool: boolean;
  onPlayPoolClick: () => void;
}) {
  const list = poolPrizes.filter((p) => p.isActive);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % list.length), 2400);
    return () => clearInterval(t);
  }, [list.length]);

  const cur = list[idx];

  return (
    <div
      className="relative h-full rounded-2xl border overflow-hidden"
      style={{
        borderColor: "oklch(0.72 0.15 85 / 0.25)",
        background:
          "linear-gradient(180deg, oklch(0.26 0.04 160) 0%, oklch(0.22 0.04 160) 100%)",
        boxShadow:
          "0 1px 0 oklch(1 0 0 / 0.04) inset, 0 12px 36px oklch(0 0 0 / 0.45), 0 0 60px oklch(0.72 0.15 85 / 0.05)",
      }}
    >
      {/* Glow decorativo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "oklch(0.72 0.15 85 / 0.08)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative p-4 sm:p-[18px] flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 w-[38px] h-[38px] rounded-[11px] flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.15 85 / 0.18), oklch(0.72 0.15 85 / 0.06))",
                border: "1px solid oklch(0.72 0.15 85 / 0.3)",
              }}
            >
              <Zap className="h-[17px] w-[17px]" style={{ color: "oklch(0.85 0.17 85)" }} />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">
                Pozo Global
              </p>
              <p className="text-[10px] text-muted-foreground">Acumulado actual</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />
              <span className="relative h-[7px] w-[7px] rounded-full bg-emerald-400" />
            </span>
            <span
              className="text-[9.5px] font-semibold uppercase"
              style={{ letterSpacing: "0.16em", color: "oklch(0.75 0.18 145)" }}
            >
              En vivo
            </span>
          </div>
        </div>

        {/* Premio mayor — protagonista */}
        <div className="text-center pt-2.5 pb-1.5">
          <p
            className="text-[10px] uppercase mb-1.5 text-muted-foreground"
            style={{ letterSpacing: "0.2em" }}
          >
            Premio mayor
          </p>
          <p
            className="font-display font-bold tabular-nums leading-none"
            style={{
              fontSize: 36,
              color: "oklch(0.85 0.17 85)",
              letterSpacing: "-0.02em",
              textShadow: "0 0 30px oklch(0.72 0.15 85 / 0.2)",
            }}
          >
            {formatCurrency(pool.currentAmount)}
          </p>
        </div>

        {/* Divisor */}
        <div
          className="my-3.5"
          style={{
            height: 1,
            background:
              "linear-gradient(to right, transparent, oklch(0.72 0.15 85 / 0.2), transparent)",
          }}
        />

        {/* Micro-carrusel de premios */}
        {cur && (
          <>
            <div className="flex items-center justify-between gap-2.5 min-h-[38px]">
              <div
                className="text-[9.5px] font-semibold uppercase shrink-0"
                style={{ letterSpacing: "0.14em", color: "oklch(0.72 0.15 85 / 0.8)" }}
              >
                + Ganá
              </div>
              <div
                key={idx}
                className="flex-1 flex items-center justify-end gap-2 animate-pool-card-fade"
              >
                <div
                  className="shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    background:
                      cur.type === "jackpot"
                        ? "oklch(0.72 0.15 85 / 0.15)"
                        : "oklch(0.32 0.03 160 / 0.6)",
                    boxShadow: "0 0 0 1px oklch(0.72 0.15 85 / 0.2)",
                  }}
                >
                  {cur.imageUrl ? (
                    <img
                      src={cdn(cur.imageUrl, 128)}
                      alt={cur.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-base leading-none select-none">
                      {getPrizeFallbackEmoji(cur)}
                    </span>
                  )}
                </div>
                <div className="text-right min-w-0">
                  <p className="font-body font-bold text-[12.5px] text-foreground leading-tight truncate">
                    {cur.name}
                  </p>
                  {cur.value != null && cur.value > 0 && (
                    <p
                      className="font-display font-bold tabular-nums"
                      style={{
                        fontSize: 10.5,
                        color: "oklch(0.78 0.03 85 / 0.65)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {formatCompact(cur.value)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dots */}
            {list.length > 1 && (
              <div className="flex justify-center gap-[3px] mt-2.5 mb-3.5">
                {list.map((_, i) => (
                  <span
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === idx ? 12 : 3,
                      height: 3,
                      background:
                        i === idx
                          ? "oklch(0.72 0.15 85)"
                          : "oklch(0.55 0.01 160 / 0.35)",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA full-width con costo integrado */}
        <button
          onClick={onPlayPoolClick}
          disabled={!canPlayPool}
          className={cn(
            "group relative w-full overflow-hidden rounded-xl h-12 font-bold transition-all duration-300 mt-auto active:scale-[0.98]",
            !canPlayPool && "opacity-50 cursor-not-allowed",
          )}
          style={{
            background: canPlayPool
              ? "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.68 0.17 70))"
              : "oklch(0.32 0.03 160)",
            color: canPlayPool ? "oklch(0.2 0.05 160)" : "oklch(0.55 0.01 160)",
            boxShadow: canPlayPool ? "0 4px 16px oklch(0.72 0.15 85 / 0.3)" : "none",
          }}
        >
          <span className="relative z-10 flex items-center justify-between px-4 h-full">
            <span className="flex items-center gap-2 uppercase text-[13px]" style={{ letterSpacing: "0.08em" }}>
              <Zap className="h-3.5 w-3.5" />
              Jugar por el Pozo
            </span>
            <span className="flex items-center gap-2">
              <span
                className="font-display font-bold tabular-nums text-[12px] px-2 py-[3px] rounded-md"
                style={{
                  background: "oklch(0.2 0.05 160 / 0.18)",
                  letterSpacing: "-0.01em",
                }}
              >
                {formatCurrency(pool.costPerPlay)}
              </span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
          {canPlayPool && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes pool-card-fade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.animate-pool-card-fade) {
          animation: pool-card-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// WELCOME SCREEN
// ============================================================

export function WelcomeScreen({
  bar,
  freeSpinsAvailable,
  pool,
  userBalance,
  banners = [],
  poolPrizes,
  onPlayClick,
  onPlayPoolClick,
  onLoadBalanceClick,
}: WelcomeScreenProps) {
  if (!bar || !bar.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando información del bar...</p>
      </div>
    );
  }

  const initials = bar.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasFreeSpins = freeSpinsAvailable > 0;
  const canPlayPool = userBalance >= pool.costPerPlay;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 gap-5 sm:gap-6 lg:justify-center">
        {/* BAR HEADER */}
        <section className="opacity-0 animate-fade-in-up flex items-center gap-3 lg:flex-col lg:gap-4 lg:mb-2">
          <div className="relative">
            <div className="hidden lg:block absolute -inset-4 rounded-full border border-primary/10 animate-spin-slow" />
            <div className="hidden lg:block absolute -inset-8 rounded-full border border-dashed border-primary/[0.06]" />

            {bar.logoUrl ? (
              <div
                className={cn(
                  "relative shrink-0 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/10",
                  "w-11 h-11 sm:w-12 sm:h-12",
                  "lg:w-24 lg:h-24 lg:ring-offset-4 lg:ring-offset-background lg:shadow-2xl lg:shadow-primary/20",
                )}
              >
                <img src={cdn(bar.logoUrl, 256)} alt={bar.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className={cn(
                  "shrink-0 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10",
                  "w-11 h-11 sm:w-12 sm:h-12",
                  "lg:w-24 lg:h-24 lg:border-2 lg:ring-2 lg:ring-primary/10 lg:ring-offset-4 lg:ring-offset-background lg:shadow-2xl lg:shadow-primary/20",
                )}
              >
                <span className={cn("font-bold text-primary font-display", "text-sm", "lg:text-2xl")}>
                  {initials}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 lg:text-center">
            <h1
              className={cn(
                "font-bold text-foreground truncate font-display",
                "text-lg sm:text-xl",
                "lg:text-3xl xl:text-4xl lg:whitespace-normal lg:text-balance",
              )}
            >
              {bar.name}
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground lg:mt-1">
              Participa por premios instantáneos jugando a la ruleta premiada
            </p>
          </div>
        </section>

        {/* CARDS */}
        <div className="w-full max-w-md lg:max-w-5xl xl:max-w-6xl flex flex-col gap-4 lg:gap-5">
          {banners.length > 0 && (
            <div className="opacity-0 animate-fade-in-up animation-delay-100">
              <BannerCarousel banners={banners} className="max-w-none" />
            </div>
          )}

          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-5 lg:items-stretch">
            {/* CARD 1: RULETA GRATIS */}
            <section className="opacity-0 animate-fade-in-up animation-delay-100">
              <div className="h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-5 lg:p-6 flex flex-col">
                <div className="flex items-start gap-3 mb-3 lg:mb-5">
                  <div className="shrink-0 w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Trophy className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="hidden lg:block text-sm font-semibold text-foreground">Ruleta Gratis</p>
                    <p className="hidden lg:block text-xs text-muted-foreground mt-0.5">Premios del bar</p>
                    <p className="lg:hidden text-sm sm:text-base font-semibold text-foreground">
                      {freeSpinsAvailable} jugadas gratuitas disponibles
                    </p>
                    <p className="lg:hidden text-xs text-muted-foreground mt-0.5">
                      Juega gratis y gana premios instantáneos del bar!
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col flex-1 items-center justify-center py-2 gap-4">
                  <div className="flex flex-col items-center">
                    <p
                      className={cn(
                        "text-6xl font-bold tabular-nums font-display",
                        hasFreeSpins ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {freeSpinsAvailable}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                      jugadas disponibles
                    </p>
                  </div>
                  <div className="w-full space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gift className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Gana cervezas, tragos y más</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Se renuevan cada día</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button
                    onClick={onPlayClick}
                    disabled={!hasFreeSpins}
                    className={cn(
                      "w-full h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl relative overflow-hidden",
                      hasFreeSpins
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-muted/80 text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wider">
                      <Trophy className="h-4 w-4" />
                      {hasFreeSpins ? "Jugar gratis" : "Sin jugadas"}
                    </span>
                    {hasFreeSpins && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none" />
                    )}
                  </Button>

                  {!hasFreeSpins && (
                    <p className="text-center text-xs text-muted-foreground mt-2.5 flex items-center justify-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Vuelve mañana para obtener más jugadas gratis
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* CARD 2: POZO GLOBAL — variante B */}
            <section className="opacity-0 animate-fade-in-up animation-delay-200">
              <PoolCard
                pool={pool}
                poolPrizes={poolPrizes}
                canPlayPool={canPlayPool}
                onPlayPoolClick={onPlayPoolClick}
              />
            </section>

            {/* CARD 3: TU SALDO */}
            <section className="opacity-0 animate-fade-in-up animation-delay-300">
              <button
                onClick={onLoadBalanceClick}
                className="lg:hidden w-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:bg-card/80 hover:border-border active:scale-[0.98] text-left"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Wallet className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Cargar más saldo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Para jugar por el pozo global
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              <div className="hidden lg:flex h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tu Saldo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cargar para jugar</p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 border border-border/40 p-4 mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Saldo actual
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums font-display",
                      canPlayPool ? "text-primary" : "text-foreground",
                    )}
                  >
                    {formatCurrency(userBalance)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Recarga rápida y segura</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Disponible al instante</span>
                  </div>
                </div>

                <button
                  onClick={onLoadBalanceClick}
                  className="mt-auto w-full h-11 sm:h-12 font-bold rounded-xl border border-primary/40 bg-card hover:bg-muted/50 text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Banknote className="h-4 w-4" />
                  <span className="uppercase tracking-wider text-sm">Cargar saldo</span>
                </button>
              </div>
            </section>
          </div>

          {/* STATS BAR — desktop */}
          <div className="hidden lg:grid lg:grid-cols-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden opacity-0 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-3 px-6 py-4 border-r border-border/40">
              <Gift className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground font-display">{bar.freeSpinsPerDay}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Jugadas gratis diarias
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-r border-border/40">
              <Trophy className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground font-display">15+</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Premios disponibles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-r border-border/40">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground font-display">
                  {pool.activePlayers ?? "—"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Jugadores activos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground font-display">Diario</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Disponible</p>
              </div>
            </div>
          </div>
        </div>

        <BetgoFooter className="pb-6 lg:pt-6 lg:pb-8" />
      </main>
    </div>
  );
}
