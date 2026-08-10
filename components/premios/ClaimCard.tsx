// components/premios/ClaimCard.tsx
"use client";

import { useState } from "react";
import { Clock, Copy, Check, Maximize2, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MyPrizeClaim } from "@/services/prize-claim.service";
import {
  formatTimeLeft,
  formatWonAt,
  msUntilExpiry,
  remainingFraction,
  urgencyOf,
  type Urgency,
} from "@/lib/prize-claim";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { QRLightbox } from "./QRLightbox";
import { useCopyCode } from "./useCopyCode";

/**
 * Tres niveles de urgencia, tres colores del sistema. No se inventa una paleta
 * nueva: rojo = destructive, dorado = primary, gris = muted-foreground.
 * El dorado es EL color de marca, así que reservarlo para "prestá atención"
 * dentro de esta lista mantiene la jerarquía sin agregar hues.
 */
const URGENCY: Record<
  Urgency,
  { strip: string; chip: string; card: string; shadow: string }
> = {
  critical: {
    strip: "bg-destructive",
    chip: "bg-destructive/15 text-destructive",
    card: "border-destructive/50",
    shadow: "0 8px 32px oklch(0.62 0.22 25 / 0.12)",
  },
  soon: {
    strip: "bg-primary/70",
    chip: "bg-primary/10 text-primary",
    card: "border-primary/25",
    shadow: "0 8px 32px oklch(0.72 0.15 85 / 0.08)",
  },
  calm: {
    strip: "bg-border",
    chip: "bg-muted/50 text-muted-foreground",
    card: "border-primary/20",
    shadow: "0 8px 32px oklch(0.72 0.15 85 / 0.08)",
  },
};

interface ClaimCardProps {
  claim: MyPrizeClaim;
  /** Timestamp del tick compartido — así todas las tarjetas laten juntas. */
  now: number;
  className?: string;
}

export function ClaimCard({ claim, now, className }: ClaimCardProps) {
  const [zoom, setZoom] = useState(false);
  const { copied, copy } = useCopyCode();

  const left = msUntilExpiry(claim, now);
  const urgency = urgencyOf(left);
  const tone = URGENCY[urgency];
  const timeLeft = formatTimeLeft(left);
  const remaining = remainingFraction(claim, now);

  return (
    <>
      <article
        className={cn(
          "overflow-hidden rounded-2xl border bg-linear-to-b from-card to-card/60",
          tone.card,
          className,
        )}
        style={{ boxShadow: tone.shadow }}
      >
        <div className={cn("h-[3px] w-full", tone.strip)} />

        {/* Premio + dónde y cuándo lo ganó */}
        <div className="flex gap-3 px-3.5 pt-3.5 pb-3">
          <div className="h-15 w-15 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
            {claim.prize.imageUrl ? (
              <img
                src={claim.prize.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Store className="h-5 w-5 text-muted-foreground/60" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-extrabold leading-tight text-primary">
              {claim.prize.name}
            </h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              {claim.bar?.name ?? "Premio global"}
              <br />
              Ganado el {formatWonAt(claim.createdAt)}
            </p>
          </div>
        </div>

        {/* Vencimiento — la información de primer orden */}
        <div
          className={cn(
            "mx-3.5 mb-3 flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[12.5px] font-semibold",
            tone.chip,
          )}
        >
          <Clock className="h-4 w-4 shrink-0" />
          <span>Vence en {timeLeft}</span>
          <span
            className="ml-auto h-1 w-16 shrink-0 overflow-hidden rounded-full bg-border"
            role="img"
            aria-label={`Queda ${Math.round(remaining * 100)}% del plazo`}
          >
            <span
              className="block h-full rounded-full bg-current transition-[width] duration-500"
              style={{ width: `${Math.max(3, remaining * 100)}%` }}
            />
          </span>
        </div>

        {/* QR — tocable entero, bien arriba de 44px */}
        <div className="flex flex-col items-center gap-2 px-3.5 pb-3.5">
          <button
            onClick={() => setZoom(true)}
            className="rounded-xl transition-transform active:scale-[0.98]"
            aria-label={`Agrandar el QR de ${claim.prize.name}`}
          >
            <QRCodeDisplay value={claim.claimCode} size={132} />
          </button>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Maximize2 className="h-3 w-3" />
            Tocá el QR para agrandarlo
          </span>
        </div>

        {/* Código alfanumérico — fallback si el escáner falla */}
        <div className="mx-3.5 mb-3.5 flex min-h-11 items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[9.5px] uppercase tracking-[0.15em] text-muted-foreground">
              Código de reclamo
            </p>
            <p className="mt-0.5 font-mono text-[15px] font-semibold tracking-[0.12em] text-primary">
              {claim.claimCode}
            </p>
          </div>
          <button
            onClick={() => copy(claim.claimCode)}
            className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Copiar código"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </article>

      <QRLightbox
        open={zoom}
        onOpenChange={setZoom}
        claimCode={claim.claimCode}
        prizeName={claim.prize.name}
        barName={claim.bar?.name}
        timeLeftLabel={timeLeft}
      />
    </>
  );
}
