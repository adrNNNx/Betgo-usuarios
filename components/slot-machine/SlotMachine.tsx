// components/slot-machine/SlotMachine.tsx
"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import { useSlotDimensions } from "@/hooks/use-slot-dimensions";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/game-logic";
import { cn } from "@/lib/utils";

import { getRandomSymbol, checkWin } from "./symbols";
import {
  SlotMachineConfig,
  SpinState,
  SlotSymbol,
} from "@/types/slot-machine-type";
import { JackpotDisplay } from "./JackpotDisplay";
import { SlotReel } from "./SlotReel";

// ==================== TIPOS ====================

type SlotMode = "free" | "pool";

interface SlotMachineProps {
  config?: Partial<SlotMachineConfig>;
  symbols: SlotSymbol[];
  symbolsLoading?: boolean;
  usingCustomSymbols?: boolean;

  /**
   * Modo de juego:
   *  - "free": jugadas gratuitas, muestra contador de jugadas restantes
   *  - "pool": jugadas pagas por el pozo, muestra saldo y costo
   */
  mode?: SlotMode;

  /** Jugadas gratuitas restantes (modo free) */
  freeSpinsRemaining: number;
  /** Saldo del usuario (modo pool) */
  userBalance?: number;
  /** Costo por jugada (modo pool) */
  costPerPlay?: number;

  onRequestSpin?: () => void;
  serverResults?: SlotSymbol[] | null;
  serverResultInfo?: {
    isWinner: boolean;
    prize?: {
      name: string;
      value?: number;
      imageUrl?: string | null;
      claimCode?: string | null;
    } | null;
  } | null;
  onAnimationComplete?: () => void;
  serverError?: string | null;
}

export function SlotMachine({
  config = {},
  symbols,
  symbolsLoading = false,
  usingCustomSymbols = false,
  mode = "free",
  freeSpinsRemaining,
  userBalance = 0,
  costPerPlay = 0,
  onRequestSpin,
  serverResults = null,
  serverResultInfo = null,
  onAnimationComplete,
  serverError = null,
}: SlotMachineProps) {
  const {
    reelCount = 5,
    title = "BetGO",
    subtitle = "",
    barLogoUrl = null,
    jackpotAmount = 0,
    currency = "Gs.",
    spinDuration = 900,
    canSpin = true,
  } = config;

  const dims = useSlotDimensions();
  const isPoolMode = mode === "pool";
  const canAfford = userBalance >= costPerPlay;

  // ==================== ESTADO ====================
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [finalSymbols, setFinalSymbols] = useState<SlotSymbol[]>([]);
  const [results, setResults] = useState<SlotSymbol[]>([]);
  const [winInfo, setWinInfo] = useState<{
    isWin: boolean;
    matchCount: number;
    symbol: SlotSymbol | null;
  } | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showLoseMessage, setShowLoseMessage] = useState(false);
  const stoppedCount = useRef(0);
  const isWaitingForServer = useRef(false);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const loseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const winTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Determinar si se puede girar
  const canSpinNow = isPoolMode
    ? canAfford && canSpin
    : freeSpinsRemaining > 0 && canSpin;

  // ==================== MANEJAR RESULTADO DEL SERVIDOR ====================
  useEffect(() => {
    if (
      serverResults &&
      serverResults.length > 0 &&
      isWaitingForServer.current
    ) {
      isWaitingForServer.current = false;
      setFinalSymbols(serverResults);
      setSpinState("spinning");
    }
  }, [serverResults]);

  useEffect(() => {
    if (serverError && isWaitingForServer.current) {
      isWaitingForServer.current = false;
      setSpinState("idle");
    }
  }, [serverError]);

  // ==================== CLICK EN GIRAR ====================
  const handleSpin = useCallback(() => {
    if (spinState !== "idle" || !canSpinNow) return;

    clearTimeout(winTimerRef.current);
    clearTimeout(loseTimerRef.current);
    setShowWin(false);
    setShowLoseMessage(false);
    setWinInfo(null);
    stoppedCount.current = 0;
    setResults([]);

    if (onRequestSpin) {
      isWaitingForServer.current = true;
      setSpinState("spinning");
      onRequestSpin();
    } else {
      const newFinals = Array.from({ length: reelCount }, () =>
        getRandomSymbol(symbols),
      );
      setFinalSymbols(newFinals);
      setSpinState("spinning");
    }
  }, [spinState, canSpinNow, reelCount, symbols, onRequestSpin]);

  // ==================== CUANDO UN REEL PARA ====================
  const handleReelStopped = useCallback(() => {
    stoppedCount.current += 1;
    if (stoppedCount.current >= reelCount) {
      setResults(finalSymbols);
      setSpinState("idle");
    }
  }, [reelCount, finalSymbols]);

  // ==================== EVALUAR RESULTADO ====================
  useEffect(() => {
    if (results.length === reelCount && results.length > 0) {
      if (serverResultInfo) {
        const matchSymbol = results[0];
        const allMatch = results.every((s) => s.id === matchSymbol.id);
        setWinInfo({
          isWin: serverResultInfo.isWinner,
          matchCount: allMatch ? reelCount : 0,
          symbol: serverResultInfo.isWinner ? matchSymbol : null,
        });

        if (serverResultInfo.isWinner) {
          setSpinState("won");
          clearTimeout(winTimerRef.current);
          winTimerRef.current = setTimeout(() => {
            setShowWin(true);
            setTimeout(() => {
              setSpinState("idle");
              onAnimationCompleteRef.current?.();
            }, 3000);
          }, 1900);
        } else {
          clearTimeout(loseTimerRef.current);
          loseTimerRef.current = setTimeout(() => {
            setShowLoseMessage(true);
            loseTimerRef.current = setTimeout(() => {
              onAnimationCompleteRef.current?.();
            }, 1850);
          }, 1450);
        }
      } else {
        const win = checkWin(results);
        setWinInfo(win);
        if (win.isWin) {
          setSpinState("won");
          setShowWin(true);
          setTimeout(() => setSpinState("idle"), 3000);
        }
      }
    }
  }, [results, reelCount, serverResultInfo]);

  // ==================== KEYBOARD ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSpin]);

  const isSpinning = spinState === "spinning";
  const isDisabled =
    isSpinning || !canSpinNow || spinState === "won" || isWaitingForServer.current;

  // Ocultar mensaje de pérdida en la última jugada gratis (ya va directo al resultado)
  const showLoseContainer = showLoseMessage && (isPoolMode || freeSpinsRemaining > 0);

  // ==================== LOADING ====================
  if (symbolsLoading) {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-3 sm:px-0">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <>
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 px-3 sm:gap-6 sm:px-0">

        {/* ===== HEADER AREA ===== */}
        {isPoolMode ? (
          /* --- POOL MODE HEADER --- */
          <div className="flex flex-col items-center gap-3 w-full animate-fade-in-up">
            {/* Pool badge with jackpot amount */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 sm:px-5 sm:py-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.15 85 / 0.15), oklch(0.72 0.15 85 / 0.05))",
                border: "1px solid oklch(0.72 0.15 85 / 0.3)",
              }}
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                Pozo Global
              </span>
              {jackpotAmount > 0 && (
                <>
                  <span className="text-primary/30 text-xs">·</span>
                  <span className="text-sm sm:text-base font-black tabular-nums text-primary">
                    {formatCurrency(jackpotAmount)}
                  </span>
                </>
              )}
              {/* Live dot */}
              <span className="relative flex h-2 w-2 ml-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </div>

            {/* Bar name (smaller in pool mode) */}
            {barLogoUrl ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-primary/20">
                  <img src={barLogoUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{title}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground font-medium">{title}</span>
            )}
          </div>
        ) : (
          /* --- FREE MODE HEADER (compacto, igual que pool) --- */
          <div className="flex flex-col items-center gap-2 animate-fade-in-up">
            {barLogoUrl ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-primary/20">
                  <img src={barLogoUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{title}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground font-medium">{title}</span>
            )}
          </div>
        )}

        {/* Jackpot Display — solo en free mode, en pool ya está en el badge */}
        {jackpotAmount > 0 && !isPoolMode && (
          <div className="animate-fade-in-up animation-delay-100">
            <JackpotDisplay
              amount={jackpotAmount}
              currency={currency}
              isAnimating={showWin}
            />
          </div>
        )}

        {/* ===== MACHINE BODY (identical for both modes) ===== */}
        <div className="relative w-full animate-fade-in-up animation-delay-200">
          {/* Gold accent top */}
          <div
            className="absolute top-0 left-1/2 z-30 h-2 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-3 sm:w-24 transition-all duration-300"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.85 0.17 85), oklch(0.65 0.15 70))",
              boxShadow: isSpinning
                ? "0 2px 20px oklch(0.72 0.15 85 / 0.6)"
                : "0 2px 10px oklch(0.72 0.15 85 / 0.4)",
            }}
          />

          {/* Main machine frame */}
          <div
            className="relative overflow-hidden rounded-xl border-2 p-0.5 sm:rounded-2xl sm:p-1 transition-shadow duration-500"
            style={{
              borderColor: "oklch(0.55 0.12 85)",
              background:
                "linear-gradient(180deg, oklch(0.28 0.04 160), oklch(0.22 0.04 160))",
              boxShadow: isSpinning
                ? "0 0 60px oklch(0.72 0.15 85 / 0.15), inset 0 2px 0 oklch(1 0 0 / 0.03), 0 20px 50px oklch(0 0 0 / 0.5)"
                : "0 0 40px oklch(0.72 0.15 85 / 0.08), inset 0 2px 0 oklch(1 0 0 / 0.03), 0 20px 50px oklch(0 0 0 / 0.5)",
            }}
          >
            <div
              className="flex items-center rounded-lg p-2 sm:rounded-xl sm:p-4"
              style={{
                background: "oklch(0.2 0.05 160)",
                boxShadow: "inset 0 2px 10px oklch(0 0 0 / 0.5)",
                gap: `${dims.reelGap}px`,
              }}
            >
              {/* Left indicator */}
              <div
                className="hidden h-3 w-3 flex-shrink-0 rounded-full transition-all duration-500 sm:block"
                style={{
                  background: showWin
                    ? "oklch(0.7 0.25 30)"
                    : isSpinning
                      ? "oklch(0.72 0.15 85)"
                      : "oklch(0.4 0.1 30)",
                  boxShadow: showWin
                    ? "0 0 12px oklch(0.7 0.25 30)"
                    : isSpinning
                      ? "0 0 10px oklch(0.72 0.15 85 / 0.6)"
                      : "none",
                }}
              />

              {/* Reels */}
              <div
                className="flex flex-1 justify-center"
                style={{ gap: `${dims.reelGap}px` }}
              >
                {Array.from({ length: reelCount }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-md sm:rounded-lg"
                    style={{
                      background: "oklch(0.22 0.04 160)",
                      boxShadow: "inset 0 2px 8px oklch(0 0 0 / 0.6)",
                    }}
                  >
                    <SlotReel
                      symbols={symbols}
                      isSpinning={isSpinning}
                      stopDelay={spinDuration + i * 400}
                      finalSymbol={finalSymbols[i]}
                      onStopped={handleReelStopped}
                      reelIndex={i}
                      symbolHeight={dims.symbolHeight}
                      symbolWidth={dims.symbolWidth}
                      emojiSize={dims.emojiSize}
                      imgSize={dims.imgSize}
                    />
                  </div>
                ))}
              </div>

              {/* Right indicator */}
              <div
                className="hidden h-3 w-3 flex-shrink-0 rounded-full transition-all duration-500 sm:block"
                style={{
                  background: showWin
                    ? "oklch(0.7 0.25 30)"
                    : isSpinning
                      ? "oklch(0.72 0.15 85)"
                      : "oklch(0.4 0.1 30)",
                  boxShadow: showWin
                    ? "0 0 12px oklch(0.7 0.25 30)"
                    : isSpinning
                      ? "0 0 10px oklch(0.72 0.15 85 / 0.6)"
                      : "none",
                }}
              />
            </div>
          </div>

          {/* Gold accent bottom */}
          <div
            className="absolute bottom-0 left-1/2 z-30 h-2 w-16 -translate-x-1/2 translate-y-1/2 rounded-full sm:h-3 sm:w-24 transition-all duration-300"
            style={{
              background:
                "linear-gradient(to top, oklch(0.85 0.17 85), oklch(0.65 0.15 70))",
              boxShadow: isSpinning
                ? "0 -2px 20px oklch(0.72 0.15 85 / 0.6)"
                : "0 -2px 10px oklch(0.72 0.15 85 / 0.4)",
            }}
          />
        </div>

        {/* ===== LOSE MESSAGE ===== */}
        <div
          className="text-center overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: showLoseContainer ? "80px" : "0px",
            opacity: showLoseContainer ? 1 : 0,
            transform: showLoseContainer ? "translateY(0)" : "translateY(-8px)",
            marginTop: showLoseContainer ? "4px" : "0px",
          }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 sm:px-5 sm:py-2"
            style={{
              background: "oklch(0.25 0.03 160 / 0.9)",
              border: "1px solid oklch(0.35 0.02 160)",
            }}
          >
            <span className="text-sm sm:text-base text-muted-foreground">
              No fue esta vez
            </span>
            {(!isPoolMode || canAfford) && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-sm sm:text-base text-primary font-medium">
                  Intentalo de nuevo
                </span>
              </>
            )}
          </div>
        </div>

        {/* ===== SPIN BUTTON ===== */}
        {isPoolMode ? (
          /* --- POOL BUTTON --- */
          <button
            onClick={handleSpin}
            disabled={isDisabled}
            className={cn(
              "group relative mt-1 w-full max-w-xs overflow-hidden rounded-xl px-6 py-3.5 sm:mt-2 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 active:scale-[0.98] animate-fade-in-up animation-delay-300",
              !isDisabled ? "shadow-lg hover:shadow-xl" : "opacity-50 cursor-not-allowed",
            )}
            style={{
              background: !isDisabled
                ? "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.68 0.17 70))"
                : "oklch(0.32 0.03 160)",
              color: !isDisabled
                ? "oklch(0.2 0.05 160)"
                : "oklch(0.55 0.01 160)",
              boxShadow: !isDisabled
                ? "0 4px 16px oklch(0.72 0.15 85 / 0.25)"
                : "none",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSpinning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="uppercase tracking-wider">Girando...</span>
                </>
              ) : spinState === "won" ? (
                <span className="uppercase tracking-wider">¡Ganaste!</span>
              ) : !canAfford ? (
                <span className="uppercase tracking-wider">Saldo insuficiente</span>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span className="uppercase tracking-wider">
                    Jugar • {formatCurrency(costPerPlay)}
                  </span>
                </>
              )}
            </span>
            {!isDisabled && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            )}
          </button>
        ) : (
          /* --- FREE BUTTON (original) --- */
          <Button
            onClick={handleSpin}
            disabled={isDisabled}
            size="lg"
            className="mt-1 w-full max-w-xs uppercase font-black tracking-wider sm:mt-2 sm:w-auto sm:px-12 sm:py-6 text-base sm:text-lg relative overflow-hidden group animate-fade-in-up animation-delay-300"
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Girando...
              </span>
            ) : spinState === "won" ? (
              "¡Ganaste!"
            ) : freeSpinsRemaining <= 0 ? (
              "Sin jugadas"
            ) : (
              "Jugar"
            )}
            {!isSpinning && freeSpinsRemaining > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none" />
            )}
          </Button>
        )}

        {/* ===== INFO BAR ===== */}
        <div className="flex items-center gap-4 animate-fade-in-up animation-delay-400">
          {!isPoolMode && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Jugadas restantes:{" "}
              <span className="font-bold text-primary">{freeSpinsRemaining}</span>
            </p>
          )}
          <p className="hidden text-xs sm:block text-muted-foreground/60">
            Presiona{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              Espacio
            </kbd>{" "}
            para girar
          </p>
        </div>
      </div>

      {/* ===== WIN OVERLAY (identical for both modes) ===== */}
      {showWin && winInfo?.isWin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            background: "oklch(0 0 0 / 0.6)",
            backdropFilter: "blur(4px)",
            animationDuration: "0.5s",
          }}
          role="dialog"
          aria-label="Resultado ganador"
        >
          <div
            className="w-full max-w-sm rounded-2xl border-2 p-6 text-center sm:p-10 animate-zoom-in-50"
            style={{
              borderColor: "oklch(0.72 0.15 85)",
              background:
                "linear-gradient(135deg, oklch(0.28 0.04 160), oklch(0.22 0.04 160))",
              boxShadow:
                "0 0 60px oklch(0.72 0.15 85 / 0.3), 0 0 120px oklch(0.72 0.15 85 / 0.1)",
              animationDuration: "0.7s",
            }}
          >
            <div className="flex items-center justify-center animate-bounce-subtle">
              {serverResultInfo?.prize?.imageUrl ? (
                <img
                  src={serverResultInfo.prize.imageUrl}
                  alt={serverResultInfo.prize.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                  crossOrigin="anonymous"
                />
              ) : winInfo.symbol?.content?.startsWith("http") ? (
                <img
                  src={winInfo.symbol.content}
                  alt={winInfo.symbol.label}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                  crossOrigin="anonymous"
                />
              ) : (
                <span className="text-5xl sm:text-6xl">
                  {winInfo.symbol?.content || "🎰"}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase sm:mt-4 sm:text-3xl text-primary font-display">
              {isPoolMode ? "¡JACKPOT!" : "¡Ganaste!"}
            </h2>
            {serverResultInfo?.prize ? (
              <>
                <p className="mt-1 text-sm sm:mt-2 sm:text-lg text-muted-foreground">
                  {serverResultInfo.prize.name}
                </p>
                {serverResultInfo.prize.value ? (
                  <p className="mt-1 text-xl font-bold sm:text-2xl text-primary font-display">
                    +{currency}{" "}
                    {serverResultInfo.prize.value.toLocaleString("es-PY")}
                  </p>
                ) : serverResultInfo.prize.claimCode ? (
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground/70 tracking-widest font-mono">
                    {serverResultInfo.prize.claimCode}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-sm sm:mt-2 sm:text-lg text-muted-foreground">
                {winInfo.matchCount} coincidencias de {winInfo.symbol?.label}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
