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
  Gift,
  Users,
  ShieldCheck,
  DollarSign,
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
  activePlayers?: number;
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
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 gap-5 sm:gap-6 lg:justify-center">
        {/* ===== BAR HEADER ===== */}
        {/* Mobile: compact row | Desktop: centered column with decorative rings */}
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
                <img
                  src={bar.logoUrl}
                  alt={bar.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "shrink-0 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10",
                  "w-11 h-11 sm:w-12 sm:h-12",
                  "lg:w-24 lg:h-24 lg:border-2 lg:ring-2 lg:ring-primary/10 lg:ring-offset-4 lg:ring-offset-background lg:shadow-2xl lg:shadow-primary/20",
                )}
              >
                <span
                  className={cn(
                    "font-bold text-primary font-display",
                    "text-sm",
                    "lg:text-2xl",
                  )}
                >
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

        {/* ===== CARDS CONTAINER ===== */}
        {/* Mobile: single column | Desktop: 3-column grid */}
        <div className="w-full max-w-md lg:max-w-5xl xl:max-w-6xl flex flex-col gap-4 lg:gap-5">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-5 lg:items-stretch">
            {/* ===== CARD 1: RULETA GRATIS ===== */}
            <section className="opacity-0 animate-fade-in-up animation-delay-100">
              <div className="h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-5 lg:p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3 lg:mb-5">
                  <div className="shrink-0 w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Trophy className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Desktop */}
                    <p className="hidden lg:block text-sm font-semibold text-foreground">
                      Ruleta Gratis
                    </p>
                    <p className="hidden lg:block text-xs text-muted-foreground mt-0.5">
                      Premios del bar
                    </p>
                    {/* Mobile */}
                    <p className="lg:hidden text-sm sm:text-base font-semibold text-foreground">
                      {freeSpinsAvailable} jugadas gratuitas disponibles
                    </p>
                    <p className="lg:hidden text-xs text-muted-foreground mt-0.5">
                      Juega gratis y gana premios instantáneos del bar!
                    </p>
                  </div>
                </div>

                {/* Desktop: big number + feature list */}
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

                {/* Button */}
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

            {/* ===== CARD 2: POZO GLOBAL ===== */}
            <section className="opacity-0 animate-fade-in-up animation-delay-200">
              <div
                className="h-full rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm p-4 sm:p-5 lg:p-6 relative overflow-hidden flex flex-col"
                style={{ boxShadow: "0 4px 24px oklch(0.72 0.15 85 / 0.06)" }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-primary/4 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Zap className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Pozo Global
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Acumulado actual
                      </p>
                    </div>
                  </div>
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
                  {/* Desktop: smaller font to avoid cramping in 1/3 column */}
                  <p className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold tabular-nums gold-text font-display">
                    {formatCurrency(pool.currentAmount)}
                  </p>
                </div>

                {/* Cost row — mobile: single line | desktop: 2-col with players */}
                <div className="mb-4 px-1">
                  <div className="lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Banknote className="h-5 w-5 text-primary" />
                    <span>
                      Costo:{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(pool.costPerPlay)}
                      </span>
                    </span>
                  </div>
                  <div className="hidden lg:grid gap-2">
                    {/* Pool info box */}
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-3 mb-4">
                      <p className="text-xs font-semibold text-foreground">
                        Juega por el pozo
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Cada jugada cuesta {formatCurrency(pool.costPerPlay)} y
                        acumula al pozo global
                      </p>
                    </div>
                    {pool.activePlayers != null && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Jugando
                        </p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {pool.activePlayers}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Play button */}
                <div className="mt-auto">
                  <button
                    onClick={onPlayPoolClick}
                    disabled={!canPlayPool}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl px-5 h-11 sm:h-12 text-sm sm:text-base font-bold transition-all duration-300 active:scale-[0.98]",
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
                </div>
              </div>
            </section>

            {/* ===== CARD 3: TU SALDO ===== */}
            <section className="opacity-0 animate-fade-in-up animation-delay-300">
              {/* Mobile: simple clickable row */}
              <button
                onClick={onLoadBalanceClick}
                className="lg:hidden w-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:bg-card/80 hover:border-border active:scale-[0.98] text-left"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Wallet className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Cargar más saldo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Para jugar por el pozo global
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {/* Desktop: full card */}
              <div className="hidden lg:flex h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Tu Saldo
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cargar para jugar
                    </p>
                  </div>
                </div>

                {/* Balance box */}
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
                {/* Features */}
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

                {/* Button */}
                <button
                  onClick={onLoadBalanceClick}
                  className="mt-auto w-full h-11 sm:h-12 font-bold rounded-xl border border-primary/40 bg-card hover:bg-muted/50 text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Banknote className="h-4 w-4" />
                  <span className="uppercase tracking-wider text-sm">
                    Cargar saldo
                  </span>
                </button>
              </div>
            </section>
          </div>

          {/* ===== STATS BAR — desktop only ===== */}
          <div className="hidden lg:grid lg:grid-cols-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden opacity-0 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-3 px-6 py-4 border-r border-border/40">
              <Gift className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground font-display">
                  {bar.freeSpinsPerDay}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Jugadas gratis diarias
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-r border-border/40">
              <Trophy className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground font-display">
                  15+
                </p>
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
                <p className="text-lg font-bold text-foreground font-display">
                  Diario
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <BetgoFooter className="pb-6 lg:pt-6 lg:pb-8" />
      </main>
    </div>
  );
}
