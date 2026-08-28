// components/premios/JackpotClaims.tsx
"use client";

import { CircleCheck, Clock, Copy, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import { formatShortDate } from "@/lib/prize-claim";
import type { MyJackpotClaim } from "@/services/jackpot-claim.service";
import type { JackpotClaimStatus } from "@/services/game.service";
import { useCopyCode } from "./useCopyCode";

/**
 * Comprobantes del pozo global, en su propia sección.
 *
 * No se mezclan con los premios físicos: el pozo no tiene QR ni mozo que lo
 * entregue, **no vence**, y su ciclo es contactar → verificar → cobrar. Ponerlos
 * en la misma lista haría creer que se reclaman igual.
 */
const ESTADO: Record<
  JackpotClaimStatus,
  { label: string; hint: string; className: string }
> = {
  pending_contact: {
    label: "Falta contactar",
    hint: "Escribile a administración con este folio para coordinar el retiro",
    className: "bg-primary/15 text-primary",
  },
  in_review: {
    label: "En verificación",
    hint: "Administración está validando tu jugada",
    className: "bg-primary/10 text-primary/90",
  },
  paid: {
    label: "Pagado",
    hint: "Retiro coordinado",
    className: "bg-emerald-500/14 text-emerald-400",
  },
};

export function JackpotClaims({
  claims,
  className,
}: {
  claims: MyJackpotClaim[];
  className?: string;
}) {
  const { copied, copy } = useCopyCode();

  if (claims.length === 0) return null;

  return (
    <section className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2 px-0.5">
        <Trophy className="h-4 w-4 text-primary" />
        <h2 className="text-[13.5px] font-semibold text-foreground/85">
          Pozos ganados
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {claims.length}
        </span>
      </div>

      {claims.map((c) => {
        const estado = ESTADO[c.status];
        return (
          <article
            key={c.id}
            className="overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-b from-card to-card/60"
            style={{ boxShadow: "0 8px 32px oklch(0.72 0.15 85 / 0.08)" }}
          >
            <div className="flex items-start gap-3 px-3.5 pt-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-extrabold leading-tight text-primary">
                  {formatCurrency(c.amount)}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                  {c.bar?.name ? `${c.bar.name} · ` : ""}
                  Ganado el {formatShortDate(c.playedAt)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  estado.className,
                )}
              >
                {c.status === "paid" ? (
                  <CircleCheck className="mr-1 inline h-3 w-3" />
                ) : (
                  <Clock className="mr-1 inline h-3 w-3" />
                )}
                {estado.label}
              </span>
            </div>

            <p className="px-3.5 pt-2 text-[11.5px] leading-relaxed text-muted-foreground/85">
              {estado.hint}
            </p>

            <div className="m-3.5 flex min-h-11 items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[9.5px] uppercase tracking-[0.15em] text-muted-foreground">
                  Folio del comprobante
                </p>
                <p className="mt-0.5 font-mono text-[15px] font-semibold tracking-[0.12em] text-primary">
                  {c.folio}
                </p>
              </div>
              <button
                onClick={() => copy(c.folio)}
                className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Copiar folio ${c.folio}`}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
