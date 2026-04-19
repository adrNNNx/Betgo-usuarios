// components/BannerCarousel.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { BannerItem } from "@/services/game.service";

interface BannerCarouselProps {
  banners: BannerItem[];
  /** Intervalo de auto-scroll en ms (default: 5000) */
  interval?: number;
  className?: string;
}

/**
 * Carrusel de banners publicitarios.
 *
 * - Auto-scroll cada 5 segundos
 * - Pausa al hacer hover/touch
 * - Si el banner tiene linkUrl, abre en nueva pestaña al hacer click
 * - Dots indicator en la parte inferior
 * - Transición suave entre slides
 * - No renderiza nada si no hay banners
 */
export function BannerCarousel({
  banners,
  interval = 5000,
  className,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const count = banners.length;

  // ==================== AUTO-SCROLL ====================
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || isPaused) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(nextSlide, interval);
    return () => clearInterval(timerRef.current);
  }, [count, isPaused, interval, nextSlide]);

  // Reset index if banners change
  useEffect(() => {
    setCurrentIndex(0);
  }, [count]);

  // ==================== NO BANNERS ====================
  if (count === 0) return null;

  const current = banners[currentIndex];

  const handleClick = () => {
    if (current.linkUrl) {
      window.open(current.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={cn("w-full max-w-2xl", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/30",
          "bg-card/40 backdrop-blur-sm",
          "shadow-sm",
          current.linkUrl && "cursor-pointer",
        )}
        onClick={handleClick}
        role={current.linkUrl ? "link" : undefined}
        aria-label={current.title}
      >
        {/* Image container */}
        <div className="relative w-full aspect-[3.5/1] sm:aspect-[4/1] overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                opacity: index === currentIndex ? 1 : 0,
                transform: index === currentIndex
                  ? "scale(1)"
                  : "scale(1.03)",
              }}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                draggable={false}
              />

              {/* Subtle gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Dots indicator (only if more than 1 banner) */}
        {count > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === currentIndex
                    ? "w-5 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70",
                )}
                aria-label={`Banner ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Sponsored label */}
        <div className="absolute top-2 right-2 rounded-md bg-black/40 backdrop-blur-sm px-2 py-0.5">
          <span className="text-[9px] uppercase tracking-wider text-white/70 font-medium">
            Publicidad
          </span>
        </div>
      </div>
    </div>
  );
}
