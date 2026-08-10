// components/premios/PremiosStates.tsx
"use client";

import { AlertCircle, RefreshCw, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/** Carga: el esqueleto de la pantalla real, no un spinner que tapa todo. */
export function PremiosSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <Skeleton className="h-3.5 w-3/5 rounded-md" />
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-3.5"
          style={{ opacity: i === 0 ? 1 : 0.6 }}
        >
          <div className="flex gap-3">
            <Skeleton className="h-15 w-15 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
          <Skeleton className="mt-3 h-8 w-full rounded-[10px]" />
          <Skeleton className="mx-auto mt-3 h-38 w-38 rounded-xl" />
          <Skeleton className="mt-3 h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Error recuperable: se reintenta sin recargar la página. */
export function PremiosError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/35 bg-card/60 px-5 py-7 text-center"
    >
      <AlertCircle className="h-7 w-7 text-destructive" />
      <div>
        <p className="font-display text-[15px] font-extrabold text-foreground">
          No pudimos cargar tus premios
        </p>
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">{message}</p>
      </div>
      <Button
        onClick={onRetry}
        disabled={retrying}
        variant="outline"
        className="mt-1 min-h-11 w-full max-w-[220px] border-border/70"
      >
        <RefreshCw className={retrying ? "animate-spin" : undefined} />
        Reintentar
      </Button>
    </div>
  );
}

/** Vacío digno: explica qué va a pasar y empuja a jugar. */
export function PremiosEmpty({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-2 pt-10 text-center">
      <div className="flex h-23 w-23 items-center justify-center rounded-full border border-primary/25 bg-primary/8 animate-float">
        <Trophy className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-xl font-extrabold text-foreground">
          Todavía no ganaste nada
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground text-pretty">
          Cuando ganes un premio en la tragamonedas te va a aparecer acá con su
          código para retirarlo en el bar.
        </p>
      </div>
      <Button onClick={onPlay} size="lg" className="mt-1.5 min-h-12 w-full font-display">
        Ir a jugar
      </Button>
    </div>
  );
}
