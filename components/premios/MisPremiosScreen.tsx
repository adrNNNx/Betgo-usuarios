// components/premios/MisPremiosScreen.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import type { MyPrizeClaim } from "@/services/prize-claim.service";
import {
  effectiveStatus,
  formatTimeLeft,
  msUntilExpiry,
  sortByUrgency,
  urgencyOf,
} from "@/lib/prize-claim";
import { useMyPrizeClaims } from "@/hooks/use-my-prize-claims";
import { useMyJackpotClaims } from "@/hooks/use-my-jackpot-claims";
import { ClaimCard } from "./ClaimCard";
import { ClaimHistory } from "./ClaimHistory";
import { JackpotClaims } from "./JackpotClaims";
import { PremiosEmpty, PremiosError, PremiosSkeleton } from "./PremiosStates";

interface MisPremiosScreenProps {
  onBack: () => void;
  /** Etiqueta del botón volver: "Volver a El Trébol" si vino de un bar. */
  backLabel?: string;
  onPlay: () => void;
}

/** Delays literales — Tailwind no ve clases construidas por interpolación. */
const CARD_DELAY = [
  "animation-delay-200",
  "animation-delay-300",
  "animation-delay-400",
] as const;

/** Un solo reloj compartido: los contadores de todas las tarjetas laten juntos. */
function useMinuteTick() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function MisPremiosScreen({
  onBack,
  backLabel = "Volver",
  onPlay,
}: MisPremiosScreenProps) {
  const { claims, total, isLoading, isRetrying, error, retry } =
    useMyPrizeClaims();
  // Segundo fetch, independiente: si el pozo falla, los premios se ven igual.
  const { claims: jackpots } = useMyJackpotClaims();
  const now = useMinuteTick();

  // El estado efectivo se calcula contra el reloj, no se lee de `status`.
  const { pending, history, critical } = useMemo(() => {
    const pending: MyPrizeClaim[] = [];
    const history: MyPrizeClaim[] = [];
    for (const c of claims) {
      if (effectiveStatus(c, now) === "pending") pending.push(c);
      else history.push(c);
    }
    const sorted = sortByUrgency(pending);
    return {
      pending: sorted,
      history,
      critical: sorted.filter(
        (c) => urgencyOf(msUntilExpiry(c, now)) === "critical",
      ),
    };
  }, [claims, now]);

  const count = pending.length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-4">
      <button
        onClick={onBack}
        className="-mx-2 -mb-2 flex min-h-11 items-center gap-2 self-start px-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>

      {isLoading ? (
        <PremiosSkeleton />
      ) : error ? (
        <PremiosError message={error} onRetry={retry} retrying={isRetrying} />
      ) : (
        <>
          {count > 0 ? (
            <>
              <header className="opacity-0 animate-fade-in-up">
                <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-[-0.01em] text-balance">
                  Tenés{" "}
                  <span className="gold-text">
                    {count} {count === 1 ? "premio" : "premios"}
                  </span>
                  <br />
                  para reclamar
                </h1>
                <p className="mt-1.5 text-[13px] text-muted-foreground text-pretty">
                  Mostrale el código o el QR al mozo. Él lo escanea y te lo
                  entrega.
                </p>
              </header>

              {critical.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/45 bg-destructive/12 px-3.5 py-3 text-[13px] leading-snug opacity-0 animate-fade-in-up animation-delay-100">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-pretty">
                    <b className="font-semibold text-destructive">
                      {critical.length === 1
                        ? "Uno vence hoy."
                        : `${critical.length} vencen hoy.`}
                    </b>{" "}
                    {critical.length === 1
                      ? `${critical[0].prize.name} se te vence en ${formatTimeLeft(msUntilExpiry(critical[0], now))}.`
                      : "Reclamalos antes de que se pierdan."}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {pending.map((c, i) => (
                  <ClaimCard
                    key={c.id}
                    claim={c}
                    now={now}
                    className={
                      i < CARD_DELAY.length
                        ? `opacity-0 animate-fade-in-up ${CARD_DELAY[i]}`
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          ) : jackpots.length === 0 ? (
            <PremiosEmpty onPlay={onPlay} />
          ) : null}

          {/*
            El pozo va en su propia sección, no mezclado con los premios
            físicos: no tiene QR ni mozo que lo entregue, no vence, y se cobra
            coordinando con administración. Son dos ciclos distintos.
          */}
          <JackpotClaims claims={jackpots} className="mt-1" />

          <ClaimHistory
            claims={history}
            truncated={total > claims.length}
            className="mt-1"
          />
        </>
      )}
    </div>
  );
}
