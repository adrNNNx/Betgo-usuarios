// components/ResultScreen.tsx
"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import type { GameResult, User } from "@/types/game";

interface BarInfo {
  name: string;
  logoUrl?: string | null;
}

interface ResultScreenProps {
  result: GameResult;
  user: User;
  spinCost: number;
  bar: BarInfo;
  onPlayGlobalPot?: () => void;
  onLoadBalance?: () => void;
  onBackToHome: () => void;
}

export function ResultScreen({
  result,
  user,
  spinCost,
  bar,
  onPlayGlobalPot,
  onLoadBalance,
  onBackToHome,
}: ResultScreenProps) {
  const canPlay = user.isAuthenticated && user.balance >= spinCost;
  const isWin = result.isWin;

  // Efecto snow durante 3 segundos
  useEffect(() => {
    if (!isWin) return;

    const colors = ["#d4a017", "#f0c040", "#ffffff", "#a8d8a8"];
    const duration = 1200;
    const animationEnd = Date.now() + duration;
    let skew = 1;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    let rafId: number;
    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      const ticks = Math.max(200, 500 * (timeLeft / duration));
      skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors,
        shapes: ["circle", "square"],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.4, 1),
        drift: randomInRange(-0.4, 0.4),
      });

      if (timeLeft > 0) rafId = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(rafId);
  }, [isWin]);

  // Iniciales del bar como fallback del logo
  const initials = bar.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm space-y-7">

        {/* ===== BAR HEADER ===== */}
        <header className="text-center opacity-0 animate-fade-in-up">
          <div className="mx-auto mb-5 inline-flex items-center gap-3 rounded-xl border border-primary/30 bg-card/80 px-5 py-2.5 backdrop-blur-sm">
            {bar.logoUrl ? (
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/30">
                <img
                  src={bar.logoUrl}
                  alt={bar.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-muted/50">
                <span className="text-xs font-bold text-primary">
                  {initials}
                </span>
              </div>
            )}
            <span className="text-base font-bold tracking-wide text-primary sm:text-lg font-display">
              {bar.name}
            </span>
          </div>

          {/* Título principal */}
          {isWin ? (
            <>
              <h1 className="text-balance text-2xl font-bold text-foreground sm:text-3xl font-display">
                ¡Felicidades!
              </h1>
              <p className="mt-2 text-sm text-primary sm:text-base">
                {result.prize?.name || "¡Ganaste un premio!"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                Se acabaron las jugadas
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Pero puedes seguir intentando
              </p>
            </>
          )}
        </header>

        {/* ===== JACKPOT CARD ===== */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-card to-card/50 p-6 shadow-lg opacity-0 animate-fade-in-up animation-delay-100"
          style={{ boxShadow: "0 8px 32px oklch(0.72 0.15 85 / 0.06)" }}
        >
          {/* Glow sutil de fondo */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

          <div className="relative space-y-5">
            {/* Monto del pozo */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-xs">
                Pozo Global
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl gold-text font-display">
                {formatCurrency(result.newPotAmount)}
              </p>
            </div>

            {/* Separador */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Saldo y Costo */}
            {user.isAuthenticated && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                    Tu saldo
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-base font-semibold tabular-nums sm:text-lg font-display",
                      canPlay
                        ? "text-emerald-400"
                        : "text-destructive"
                    )}
                  >
                    {formatCurrency(user.balance)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                    Costo por jugada
                  </p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground sm:text-lg font-display">
                    {formatCurrency(spinCost)}
                  </p>
                </div>
              </div>
            )}

            {/* Mensaje de saldo suficiente */}
            {canPlay && (
              <div className="rounded-lg px-4 py-2.5 text-center"
                style={{ background: "oklch(0.45 0.15 155 / 0.12)" }}
              >
                <p className="text-xs font-medium text-emerald-400 sm:text-sm">
                  Tienes saldo suficiente para jugar
                </p>
              </div>
            )}

            {/* Mensaje de premio ganado */}
            {isWin && result.prize && (
              <div className="rounded-lg px-4 py-3 text-center"
                style={{ background: "oklch(0.72 0.15 85 / 0.1)" }}
              >
                <p className="text-xs font-medium text-primary sm:text-sm">
                  {result.prize.description}
                </p>
                {result.prize.value ? (
                  <p className="mt-1 text-lg font-bold text-primary font-display">
                    +{formatCurrency(result.prize.value)}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* ===== BOTONES DE ACCIÓN ===== */}
        <div className="space-y-3 opacity-0 animate-fade-in-up animation-delay-200">
          {/* Jugar por el Pozo Global */}
          {canPlay && onPlayGlobalPot && (
            <button
              onClick={onPlayGlobalPot}
              className="group relative w-full overflow-hidden rounded-xl px-6 py-4 text-base font-bold shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98] sm:text-lg font-display"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.68 0.17 70))",
                color: "oklch(0.2 0.05 160)",
                boxShadow: "0 4px 20px oklch(0.72 0.15 85 / 0.25)",
              }}
            >
              <span className="relative z-10">Jugar por el Pozo Global</span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          )}

          {/* Cargar más saldo */}
          {user.isAuthenticated && onLoadBalance && (
            <button
              onClick={onLoadBalance}
              className="w-full rounded-xl border-2 border-primary/30 px-6 py-3.5 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/50 active:scale-[0.98] sm:text-base"
              style={{ background: "oklch(0.72 0.15 85 / 0.08)" }}
            >
              Cargar más saldo
            </button>
          )}

          {/* Volver al inicio */}
          <button
            onClick={onBackToHome}
            className="w-full rounded-xl bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98] sm:text-base"
          >
            Volver al inicio
          </button>
        </div>

        {/* Nota para no autenticados */}
        {!user.isAuthenticated && (
          <p className="text-center text-xs text-muted-foreground opacity-0 animate-fade-in-up animation-delay-300">
            Regístrate o inicia sesión para jugar por el pozo global
          </p>
        )}
      </div>
    </div>
  );
}
