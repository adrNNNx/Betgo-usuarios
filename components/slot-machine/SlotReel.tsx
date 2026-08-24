// components/slot-machine/slot-reel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SlotSymbol } from "../../types/slot-machine-type";
import { cdn } from "@/lib/cdn";
import { generateReelStrip } from "./symbols";

interface SlotReelProps {
  symbols: SlotSymbol[];
  isSpinning: boolean;
  stopDelay: number;
  finalSymbol?: SlotSymbol;
  onStopped?: () => void;
  reelIndex: number;
  symbolHeight: number;
  symbolWidth: number;
  emojiSize: string;
  imgSize: string;
}

const VISIBLE_SYMBOLS = 3;
const STRIP_LENGTH = 30;

export function SlotReel({
  symbols,
  isSpinning,
  stopDelay,
  finalSymbol,
  onStopped,
  reelIndex,
  symbolHeight,
  symbolWidth,
  emojiSize,
  imgSize,
}: SlotReelProps) {
  const [strip, setStrip] = useState<SlotSymbol[]>(() =>
    generateReelStrip(symbols, STRIP_LENGTH)
  );
  const [offset, setOffset] = useState(0);
  const [isStopping, setIsStopping] = useState(false);
  const [hasStopped, setHasStopped] = useState(true);
  const animFrameRef = useRef<number>(0);
  const speedRef = useRef(0);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const startSpin = useCallback(() => {
    setHasStopped(false);
    setIsStopping(false);
    speedRef.current = 15 + reelIndex * 2; // Each reel spins slightly faster
    offsetRef.current = 0;
    lastTimeRef.current = performance.now();

    const newStrip = generateReelStrip(symbols, STRIP_LENGTH);
    setStrip(newStrip);

    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 16.67; // ~60fps normalization
      lastTimeRef.current = time;
      offsetRef.current += speedRef.current * delta;
      setOffset(offsetRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Schedule stop
    stopTimerRef.current = setTimeout(() => {
      setIsStopping(true);
    }, stopDelay);
  }, [symbols, stopDelay, reelIndex]);

  // Start spinning when needed
  useEffect(() => {
    if (isSpinning && hasStopped) {
      startSpin();
    }
  }, [isSpinning, hasStopped, startSpin]);

  // Handle deceleration
  useEffect(() => {
    if (isStopping) {
      const decelerate = () => {
        speedRef.current *= 0.92; // Deceleration factor
        if (speedRef.current < 0.5) {
          speedRef.current = 0;
          cancelAnimationFrame(animFrameRef.current);

          // Snap to final symbol
          if (finalSymbol) {
            const newStrip = [...strip];
            const centerIndex =
              Math.floor(offsetRef.current / symbolHeight) % newStrip.length;
            const safeIndex =
              ((centerIndex + 1) % newStrip.length + newStrip.length) %
              newStrip.length;
            newStrip[safeIndex] = finalSymbol;
            setStrip(newStrip);
            setOffset(safeIndex * symbolHeight);
          }

          setHasStopped(true);
          setIsStopping(false);
          onStopped?.();
          return;
        }
        requestAnimationFrame(decelerate);
      };
      requestAnimationFrame(decelerate);
    }
  }, [isStopping, finalSymbol, onStopped, strip, symbolHeight]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  // Calculate visible symbols based on current offset
  const visibleSymbols: SlotSymbol[] = [];
  const baseIndex = Math.floor(offset / symbolHeight);
  const fractionalOffset = offset % symbolHeight;

  for (let i = -1; i <= VISIBLE_SYMBOLS; i++) {
    const index =
      ((baseIndex + i) % strip.length + strip.length) % strip.length;
    visibleSymbols.push(strip[index]);
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ height: symbolHeight * VISIBLE_SYMBOLS }}
    >
      {/* Top gradient fade - ADAPTED COLORS */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-10"
        style={{
          height: symbolHeight,
          background:
            "linear-gradient(to bottom, oklch(0.2 0.05 160 / 0.95), transparent)",
        }}
      />

      {/* Bottom gradient fade - ADAPTED COLORS */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-10"
        style={{
          height: symbolHeight,
          background:
            "linear-gradient(to top, oklch(0.2 0.05 160 / 0.95), transparent)",
        }}
      />

      {/* Center highlight line - PRIMARY COLOR */}
      <div
        className="pointer-events-none absolute right-0 left-0 z-20 border-t border-b"
        style={{
          top: symbolHeight,
          height: symbolHeight,
          borderColor: "oklch(0.72 0.15 85 / 0.6)", // primary color
          boxShadow:
            "0 0 20px oklch(0.72 0.15 85 / 0.15), inset 0 0 20px oklch(0.72 0.15 85 / 0.05)",
        }}
      />

      {/* Symbol strip */}
      <div
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(${-fractionalOffset}px)`,
          transition:
            hasStopped && !isSpinning
              ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
        }}
      >
        {visibleSymbols.map((symbol, i) => {
          const isCenter = i === 1;
          return (
            <div
              key={`${symbol.id}-${i}`}
              className="flex items-center justify-center"
              style={{
                height: symbolHeight,
                width: symbolWidth,
                opacity: isCenter ? 1 : 0.4,
                transform: isCenter ? "scale(1.15)" : "scale(0.85)",
                transition: hasStopped
                  ? "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "none",
                filter: isCenter
                  ? "drop-shadow(0 0 8px oklch(0.72 0.15 85 / 0.4))" // primary glow
                  : "none",
              }}
            >
              {symbol.content.startsWith("http") ? (
                <img
                  // 56px como máximo en desktop (w-14) → 128 para retina
                  src={cdn(symbol.content, 128)}
                  alt={symbol.label}
                  className={`${imgSize} object-contain`}
                  crossOrigin="anonymous"
                />
              ) : (
                <span className={`select-none ${emojiSize} leading-none`}>
                  {symbol.content}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
