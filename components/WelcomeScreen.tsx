// components/WelcomeScreen.tsx
"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Zap,
  ChevronRight,
  Wallet,
  Clock,
  Banknote,
} from "lucide-react";
import { BetgoFooter } from "@/components/BetgoFooter";

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
}

interface WelcomeScreenProps {
  bar: Bar;
  freeSpinsAvailable: number;
  pool: PoolInfo;
  userBalance: number;
  onPlayClick: () => void;
  onPlayPoolClick: () => void;
  onLoadBalanceClick: () => void;
}

export function WelcomeScreen({
  bar,
  freeSpinsAvailable,
  pool,
  userBalance,
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

      {/* ===== MAIN ===== */}
      <main className="relative z-10 flex flex-col items-center px-4 sm:px-6 pt-6 gap-5 sm:gap-6">

        {/* ===== BAR HEADER (compact) ===== */}
        <section className="flex items-center gap-3 opacity-0 animate-fade-in-up">
          {bar.logoUrl ? (
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/10">
              <img
                src={bar.logoUrl}
                alt={bar.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="text-sm font-bold text-primary font-display">
                {initials}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate font-display">
              {bar.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Ruleta premiada
            </p>
          </div>
        </section>

        {/* ===== CARDS CONTAINER ===== */}
        <div className="w-full max-w-md flex flex-col gap-4">

          {/* ===== CARD 1: JUGADAS GRATUITAS ===== */}
          <section className="opacity-0 animate-fade-in-up animation-delay-100">
            <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Trophy className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {freeSpinsAvailable} jugadas gratuitas disponibles
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Juega gratis y gana premios instantáneos del bar!
                  </p>
                </div>
              </div>

              {/* Button */}
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
                <span className="uppercase tracking-wider">
                  {hasFreeSpins
                    ? `Jugar gratis (${freeSpinsAvailable})`
                    : "Sin jugadas disponibles"}
                </span>
                {hasFreeSpins && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none" />
                )}
              </Button>

              {/* Footnote */}
              {!hasFreeSpins && (
                <p className="text-center text-xs text-muted-foreground mt-2.5 flex items-center justify-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Vuelve mañana para obtener más jugadas gratis
                </p>
              )}
            </div>
          </section>

          {/* ===== CARD 2: POZO GLOBAL ===== */}
          <section className="opacity-0 animate-fade-in-up animation-delay-200">
            <div
              className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm p-4 sm:p-5 relative overflow-hidden"
              style={{
                boxShadow: "0 4px 24px oklch(0.72 0.15 85 / 0.06)",
              }}
            >
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.04] to-transparent pointer-events-none" />

              <div className="relative">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Pozo Global
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Acumulado actual
                      </p>
                    </div>
                  </div>
                  {/* EN VIVO badge */}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="font-medium uppercase tracking-wider text-[10px]">
                      En vivo
                    </span>
                  </div>
                </div>

                {/* Jackpot amount */}
                <div className="rounded-xl bg-muted/40 border border-border/40 p-4 mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Premio mayor
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold tabular-nums gold-text font-display">
                    {formatCurrency(pool.currentAmount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    Crece con cada jugada
                  </p>
                </div>

                {/* Cost + players row */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Banknote className="h-5 w-5 text-primary"/>
                    <span>
                      Costo:{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(pool.costPerPlay)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Play button */}
                <button
                  onClick={onPlayPoolClick}
                  disabled={!canPlayPool}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl px-5 py-3.5 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 active:scale-[0.98]",
                    canPlayPool
                      ? "shadow-lg hover:shadow-xl"
                      : "opacity-50 cursor-not-allowed",
                  )}
                  style={{
                    background: canPlayPool
                      ? "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.68 0.17 70))"
                      : "oklch(0.32 0.03 160)",
                    color: canPlayPool
                      ? "oklch(0.2 0.05 160)"
                      : "oklch(0.55 0.01 160)",
                    boxShadow: canPlayPool
                      ? "0 4px 16px oklch(0.72 0.15 85 / 0.25)"
                      : "none",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="uppercase tracking-wider">
                      Jugar por el Pozo
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  {canPlayPool && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </button>

                {/* Balance info */}
                <p className="text-center text-xs text-muted-foreground mt-2.5">
                  Tu saldo:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      canPlayPool ? "text-emerald-400" : "text-destructive",
                    )}
                  >
                    {formatCurrency(userBalance)}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* ===== CARD 3: CARGAR SALDO ===== */}
          <section className="opacity-0 animate-fade-in-up animation-delay-300">
            <button
              onClick={onLoadBalanceClick}
              className="w-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:bg-card/80 hover:border-border active:scale-[0.98] text-left"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wallet className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Cargar más saldo
                </p>
                <p className="text-xs text-muted-foreground">
                  Para jugar por el pozo global
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </section>
        </div>

        {/* ===== FOOTER ===== */}
        <BetgoFooter className="pt-2 pb-6" />
      </main>
    </div>
  );
}
