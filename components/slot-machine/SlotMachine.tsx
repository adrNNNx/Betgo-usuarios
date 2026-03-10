// components/slot-machine/slot-machine.tsx
"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import { useSlotDimensions } from "@/hooks/use-slot-dimensions";
import { useBarSymbols } from "@/hooks/use-bar-symbols";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { getRandomSymbol, checkWin } from "./symbols";

import {
  SlotMachineConfig,
  SpinState,
  SlotSymbol,
} from "@/types/slot-machine-type";

import { JackpotDisplay } from "./JackpotDisplay";
import { SlotReel } from "./SlotReel";

interface SlotMachineProps {
  config?: Partial<SlotMachineConfig>;
  barSlug?: string | null;
}

export function SlotMachine({ config = {}, barSlug = null }: SlotMachineProps) {
  const {
    reelCount = 5,
    symbols: customSymbols,
    title = "EL MARISCAL",
    subtitle = "BARRA & CERVEZA",
    barLogoUrl = null,
    jackpotAmount = 32000,
    currency = "Gs.",
    freeSpins = 3,
    spinDuration = 2000,
    onSpinComplete,
    onSpinStart,
    canSpin = true,
  } = config;

  const dims = useSlotDimensions();

  const {
    symbols: barSymbols,
    loading: symbolsLoading,
    usingCustomSymbols,
  } = useBarSymbols(barSlug);

  const symbols = customSymbols || barSymbols;

  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [remainingSpins, setRemainingSpins] = useState(freeSpins);
  const [currentJackpot, setCurrentJackpot] = useState(jackpotAmount);
  const [finalSymbols, setFinalSymbols] = useState<SlotSymbol[]>([]);
  const [results, setResults] = useState<SlotSymbol[]>([]);
  const [winInfo, setWinInfo] = useState<{
    isWin: boolean;
    matchCount: number;
    symbol: SlotSymbol | null;
  } | null>(null);
  const stoppedCount = useRef(0);
  const [showWin, setShowWin] = useState(false);

  const handleSpin = useCallback(() => {
    if (spinState !== "idle" || remainingSpins <= 0 || !canSpin) return;

    setShowWin(false);
    setWinInfo(null);
    stoppedCount.current = 0;

    const newFinals = Array.from({ length: reelCount }, () =>
      getRandomSymbol(symbols),
    );
    setFinalSymbols(newFinals);
    setResults([]);
    setSpinState("spinning");
    setRemainingSpins((prev) => prev - 1);
    onSpinStart?.();
  }, [spinState, remainingSpins, canSpin, reelCount, symbols, onSpinStart]);

  const handleReelStopped = useCallback(() => {
    stoppedCount.current += 1;
    if (stoppedCount.current >= reelCount) {
      setResults(finalSymbols);
      setSpinState("idle");
    }
  }, [reelCount, finalSymbols]);

  useEffect(() => {
    if (results.length === reelCount && results.length > 0) {
      const win = checkWin(results);
      setWinInfo(win);
      if (win.isWin) {
        setSpinState("won");
        setShowWin(true);
        const prize = (win.symbol?.multiplier || 1) * 1000 * win.matchCount;
        setCurrentJackpot((prev) => prev + prize);
        setTimeout(() => setSpinState("idle"), 3000);
      }
      onSpinComplete?.(results);
    }
  }, [results, reelCount, onSpinComplete]);

  // Keyboard support
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

  if (symbolsLoading) {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-3 sm:px-0">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando configuración del bar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 px-3 sm:gap-6 sm:px-0">
        {/* Bar Logo + Title */}
        <div
          className="rounded-xl border px-5 py-2 text-center sm:px-8 sm:py-3 backdrop-blur-md animate-fade-in-up"
          style={{
            borderColor: "oklch(0.35 0.02 160)",
            background: "oklch(0.26 0.04 160 / 0.9)",
          }}
        >
          {barLogoUrl ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-lg">
                <img
                  src={barLogoUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-base font-black uppercase tracking-wider sm:text-xl text-primary font-display">
                  {title}
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-xs text-muted-foreground">
                  {subtitle}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-base font-black uppercase tracking-wider sm:text-xl text-primary font-display">
                {title}
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          )}

          {usingCustomSymbols && (
            <p className="mt-1 text-[8px] text-primary/60 uppercase tracking-wider">
              Símbolos personalizados • {symbols.length} configurados
            </p>
          )}
        </div>

        {/* Jackpot Display */}
        <div className="animate-fade-in-up animation-delay-100">
          <JackpotDisplay
            amount={currentJackpot}
            currency={currency}
            isAnimating={showWin}
          />
        </div>

        {/* Machine body */}
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
            {/* Inner frame */}
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

        {/* Spin Button */}
        <Button
          onClick={handleSpin}
          disabled={
            isSpinning || remainingSpins <= 0 || !canSpin || spinState === "won"
          }
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
          ) : (
            "Girar"
          )}
          {/* Shimmer effect */}
          {!isSpinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none" />
          )}
        </Button>

        {/* Info bar */}
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-6 animate-fade-in-up animation-delay-400">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Jugadas gratuitas restantes:{" "}
            <span className="font-bold text-primary">{remainingSpins}</span>
          </p>
          <p className="hidden text-xs sm:block text-muted-foreground/60">
            Presiona{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              Espacio
            </kbd>{" "}
            para girar
          </p>
        </div>
      </div>

      {/* Win overlay */}
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
            <div className="text-5xl sm:text-6xl animate-bounce-subtle">
              {winInfo.symbol?.content}
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase sm:mt-4 sm:text-3xl text-primary font-display">
              ¡Ganaste!
            </h2>
            <p className="mt-1 text-sm sm:mt-2 sm:text-lg text-muted-foreground">
              {winInfo.matchCount} coincidencias de {winInfo.symbol?.label}
            </p>
            <p className="mt-1 text-xl font-bold sm:text-2xl text-primary font-display">
              +{currency}{" "}
              {(
                (winInfo.symbol?.multiplier || 1) *
                1000 *
                winInfo.matchCount
              ).toLocaleString("es-PY")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
