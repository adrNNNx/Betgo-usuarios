// implementacion/juego/FreePlayVenue.tsx
"use client";

import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";

interface FreePlayVenueProps {
  barName: string;
  barLogoUrl?: string | null;
  /** Jugadas gratis que quedan hoy */
  remaining: number;
  /** Total de jugadas gratis por día del bar */
  total: number;
  className?: string;
}

/**
 * Encabezado de la pantalla de jugadas gratuitas: el bar es el protagonista
 * (es SU promoción) y las jugadas restantes se muestran como fichas que se
 * van gastando. El troquelado de cada ficha refuerza la idea de cupón —
 * lo opuesto al metal dorado del pozo.
 */
export function FreePlayVenue({
  barName,
  barLogoUrl,
  remaining,
  total,
  className,
}: FreePlayVenueProps) {
  const tickets = Array.from({ length: Math.max(total, remaining) });

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div
        className="flex items-center gap-[11px] rounded-[15px] px-[13px] py-3"
        style={{
          border: "1px solid oklch(0.74 0.15 158 / 0.28)",
          background:
            "linear-gradient(160deg, oklch(0.74 0.15 158 / 0.10), oklch(0.26 0.04 160) 70%)",
        }}
      >
        <div
          className="grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-full"
          style={{
            background: "oklch(0.28 0.02 160)",
            border: "1px solid oklch(0.74 0.15 158 / 0.38)",
          }}
        >
          {barLogoUrl ? (
            <img
              src={cdn(barLogoUrl, 96)}
              alt={barName}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <span
              className="font-display text-[8px] font-extrabold"
              style={{ color: "oklch(0.74 0.15 158)" }}
            >
              {barName.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[16px] font-extrabold leading-tight">
            {barName}
          </div>
          <div className="mt-[3px] flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span
              className="font-display text-[8.5px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "oklch(0.74 0.15 158)" }}
            >
              Jugadas gratis del día
            </span>
          </div>
        </div>

        <div className="flex-none text-right">
          <div
            className="font-display text-[22px] font-black leading-none tabular-nums"
            style={{ color: "oklch(0.74 0.15 158)" }}
          >
            {remaining}
          </div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            de {total}
          </div>
        </div>
      </div>

      {/* Fichas */}
      <div
        className="mt-2 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${tickets.length}, 1fr)` }}
      >
        {tickets.map((_, i) => {
          const used = i >= remaining;
          return (
            <div
              key={i}
              className="relative flex h-9 items-center justify-center overflow-hidden rounded-[9px] font-display text-[9.5px] font-extrabold uppercase tracking-[0.14em]"
              style={
                used
                  ? {
                      background: "oklch(0.28 0.02 160 / 0.55)",
                      border: "1px dashed oklch(0.35 0.02 160 / 0.75)",
                      color: "oklch(0.55 0.01 160 / 0.85)",
                    }
                  : {
                      background:
                        "linear-gradient(135deg, oklch(0.74 0.15 158 / 0.22), oklch(0.74 0.15 158 / 0.10))",
                      border: "1px solid oklch(0.74 0.15 158 / 0.45)",
                      color: "oklch(0.86 0.13 158)",
                    }
              }
            >
              {/* troquelado del cupón */}
              <span
                className="absolute -top-[5px] left-[26px] h-[9px] w-[9px] rounded-full"
                style={{ background: "oklch(0.2 0.05 160)" }}
              />
              <span
                className="absolute -bottom-[5px] left-[26px] h-[9px] w-[9px] rounded-full"
                style={{ background: "oklch(0.2 0.05 160)" }}
              />
              <span className="absolute inset-y-0 left-0 grid w-[26px] place-items-center font-display text-[12px] font-extrabold">
                {i + 1}
              </span>
              {used ? "Usada" : "Gratis"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
