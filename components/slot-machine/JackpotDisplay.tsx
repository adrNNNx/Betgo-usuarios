// components/slot-machine/jackpot-display.tsx
"use client";

import { useEffect, useState, useRef } from "react";

interface JackpotDisplayProps {
  amount: number;
  currency: string;
  isAnimating?: boolean;
}

export function JackpotDisplay({
  amount,
  currency,
  isAnimating,
}: JackpotDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const animRef = useRef<number>(0);

  // Animate number changes
  useEffect(() => {
    if (displayAmount === amount) return;
    const start = displayAmount;
    const diff = amount - start;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setDisplayAmount(Math.round(start + diff * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [amount, displayAmount]);

  const formatted = displayAmount.toLocaleString("es-PY");

  return (
    <div
      className={`relative w-full max-w-xs overflow-hidden rounded-xl border px-4 py-2 text-center transition-all duration-500 sm:max-w-sm sm:px-8 sm:py-3 ${
        isAnimating ? "scale-105" : "scale-100"
      }`}
      style={{
        borderColor: "oklch(0.72 0.15 85 / 0.5)", // primary border
        background:
          "linear-gradient(135deg, oklch(0.26 0.04 160), oklch(0.32 0.03 160))", // card gradient
        boxShadow: isAnimating
          ? "0 0 30px oklch(0.72 0.15 85 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.05)"
          : "0 0 15px oklch(0.72 0.15 85 / 0.1), inset 0 1px 0 oklch(1 0 0 / 0.05)",
      }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-widest sm:text-xs"
        style={{ color: "oklch(0.65 0.04 90)" }} // muted text
      >
        Pozo Global
      </p>
      <p
        className="mt-0.5 text-xl font-black tabular-nums tracking-tight sm:mt-1 sm:text-3xl font-display"
        style={{ color: "oklch(0.72 0.15 85)" }} // primary color
      >
        {currency} {formatted}
      </p>
      {/* Shimmer effect */}
      <div
        className="pointer-events-none absolute inset-0 animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.03) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
