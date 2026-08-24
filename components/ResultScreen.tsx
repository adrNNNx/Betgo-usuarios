// components/ResultScreen.tsx
"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { cdn } from "@/lib/cdn";
import { formatCurrency } from "@/lib/game-logic";
import type { GameResult, User } from "@/types/game";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface BarInfo {
  name: string;
  logoUrl?: string | null;
}

interface ResultScreenProps {
  result: GameResult;
  user: User;
  spinCost: number;
  bar: BarInfo;
  /** Si viene de jugar por el pozo global */
  fromPool?: boolean;
  onPlayGlobalPot?: () => void;
  onLoadBalance?: () => void;
  onBackToHome: () => void;
}

export function ResultScreen({
  result,
  user,
  spinCost,
  bar,
  fromPool = false,
  onPlayGlobalPot,
  onLoadBalance,
  onBackToHome,
}: ResultScreenProps) {
  const canPlay = user.isAuthenticated && user.balance >= spinCost;
  const isWin = result.isWin;
  // El pozo llega como premio sintético con id 'jackpot'. Comparar por
  // prize.type sería incorrecto: un premio físico también puede tenerlo.
  const isJackpot = result.prize?.id === "jackpot";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result.prize?.claimCode) return;
    navigator.clipboard.writeText(result.prize.claimCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Snow confetti al ganar
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
        origin: { x: Math.random(), y: Math.random() * skew - 0.2 },
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

  // Iniciales del bar como fallback
  const initials = bar.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm space-y-5">
        {/* ===== BAR HEADER ===== */}
        <header className="text-center opacity-0 animate-fade-in-up">
          <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-xl border border-primary/30 bg-card/80 px-5 py-2.5 backdrop-blur-sm">
            {bar.logoUrl ? (
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/30">
                <img
                  src={cdn(bar.logoUrl, 96)}
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
            <span className="font-display text-base font-bold tracking-wide text-primary sm:text-lg">
              {bar.name}
            </span>
          </div>

          {isWin ? (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {isJackpot ? "¡Ganaste el pozo!" : "¡Felicidades!"}
              </h1>
              <p className="mt-1.5 text-sm text-primary sm:text-base">
                {isJackpot
                  ? "El pozo global completo es tuyo"
                  : result.matchCount && result.matchSymbolLabel
                    ? `${result.matchCount} iguales de ${result.matchSymbolLabel}`
                    : "Ganaste un premio"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                {fromPool
                  ? "Saldo insuficiente"
                  : "Se acabaron las jugadas"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                {fromPool
                  ? "Carga más saldo para seguir jugando por el pozo"
                  : "Pero puedes seguir intentando"}
              </p>
            </>
          )}
        </header>

        {/* ===== PRIZE CARD (solo al ganar) ===== */}
        {isWin && result.prize && (
          <div
            className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-b from-card to-card/60 shadow-lg opacity-0 animate-fade-in-up animation-delay-100"
            style={{ boxShadow: "0 8px 32px oklch(0.72 0.15 85 / 0.08)" }}
          >
            {/* Imagen + nombre del premio */}
            <div className="flex flex-col items-center px-6 pt-6 pb-5">
              {result.prize.imageUrl && (
                <div className="mb-4 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
                  <img
                    src={cdn(result.prize.imageUrl, 256)}
                    alt={result.prize.name}
                    className="h-full w-full object-contain drop-shadow-lg"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              <p className="font-display text-lg font-bold text-primary sm:text-xl text-center">
                {result.prize.name}
              </p>
              {result.prize.value ? (
                <p className="mt-1 font-display text-2xl font-bold text-primary sm:text-3xl">
                  +{formatCurrency(result.prize.value)}
                </p>
              ) : null}
            </div>

            {/* Divisoria (solo si hay algo debajo) */}
            {(isJackpot || result.prize.claimQrCode) && (
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            )}

            {/* Jackpot: la plata va directo al saldo, no hay nada que reclamar */}
            {isJackpot && (
              <p className="px-6 py-4 text-center text-xs text-muted-foreground sm:text-sm">
                Acreditado a tu saldo — ya podés usarlo para jugar
              </p>
            )}

            {/* QR + Código */}
            {result.prize.claimQrCode && (
              <div className="space-y-4 px-6 py-5">
                {/* QR */}
                <div className="text-center">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-xs">
                    Escanea para reclamar
                  </p>
                  <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm ring-1 ring-border/20">
                    <img
                      src={result.prize.claimQrCode}
                      alt="QR de reclamo"
                      className="h-40 w-40 object-contain sm:h-44 sm:w-44"
                    />
                  </div>
                </div>

                {/* Código de reclamo */}
                {result.prize.claimCode && (
                  <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-xs">
                      Código de reclamo
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold tracking-widest text-primary sm:text-base">
                        {result.prize.claimCode}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Copiar código"
                      >
                        {copied ? (
                          <svg
                            className="h-4 w-4 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-center text-[11px] text-muted-foreground/60 sm:text-xs">
                  Presenta este código en el local para reclamar tu premio
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== JACKPOT CTA CARD ===== */}
        {onPlayGlobalPot && (
          <div
            className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-b from-card to-card/60 p-5 shadow-lg opacity-0 animate-fade-in-up animation-delay-200"
            style={{ boxShadow: "0 8px 32px oklch(0.72 0.15 85 / 0.06)" }}
          >
            {/* Header del card */}
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp />
              <p className="text-sm font-semibold text-foreground sm:text-base">
                ¡Prueba tu suerte por el pozo!
              </p>
            </div>

            {/* Monto del pozo */}
            <div className="mb-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-xs">
                Pozo Global Acumulado
              </p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-primary sm:text-4xl gold-text">
                {formatCurrency(result.newPotAmount)}
              </p>
            </div>

            {/* Saldo y Costo */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                  Tu saldo
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-display text-base font-semibold tabular-nums sm:text-lg",
                    canPlay ? "text-emerald-400" : "text-destructive",
                  )}
                >
                  {formatCurrency(user.balance)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                  Costo por jugada
                </p>
                <p className="mt-0.5 font-display text-base font-semibold tabular-nums text-foreground sm:text-lg">
                  {formatCurrency(spinCost)}
                </p>
              </div>
            </div>

            {/* Botón jugar por el pozo */}
            {canPlay ? (
              <Button
                onClick={onPlayGlobalPot}
                size="lg"
                className="w-full font-display text-base sm:text-lg"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Jugar por el pozo
              </Button>
            ) : (
              <div className="rounded-xl border border-border/30 bg-muted/30 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Necesitas{" "}
                  <span className="font-semibold text-primary">
                    {formatCurrency(spinCost)}
                  </span>{" "}
                  para jugar por el pozo global
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== BOTONES SECUNDARIOS ===== */}
        <div className="space-y-3 opacity-0 animate-fade-in-up animation-delay-200">
          {/* Cargar más saldo */}
          {user.isAuthenticated && onLoadBalance && (
            <Button
              onClick={onLoadBalance}
              variant="outline"
              size="lg"
              className="w-full border-primary/40 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Cargar más saldo
            </Button>
          )}

          {/* Volver al inicio */}
          <Button
            onClick={onBackToHome}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-white"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Button>
        </div>

        {/* Nota para no autenticados */}
        {!user.isAuthenticated && (
          <p className="text-center text-xs text-muted-foreground/70 opacity-0 animate-fade-in-up animation-delay-300">
            Regístrate o inicia sesión para jugar por el pozo global
          </p>
        )}
      </div>
    </div>
  );
}
