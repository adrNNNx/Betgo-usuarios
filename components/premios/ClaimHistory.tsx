// components/premios/ClaimHistory.tsx
"use client";

import { CircleCheck, CircleSlash, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { cdn } from "@/lib/cdn";
import type { MyPrizeClaim } from "@/services/prize-claim.service";
import { effectiveStatus, formatShortDate, sortByRecency } from "@/lib/prize-claim";

/**
 * Historial en un `<details>` nativo, cerrado por defecto.
 * Mismo precedente que `components/slot-machine/PayoutTable.tsx`: si la etiqueta
 * nativa alcanza, no se monta un Accordion. Cerrado y en gris para que no le
 * compita a los pendientes, pero a un toque de distancia.
 */
export function ClaimHistory({
  claims,
  truncated = false,
  className,
}: {
  claims: MyPrizeClaim[];
  /** El backend devolvió más claims de los que trajimos: falta historial viejo. */
  truncated?: boolean;
  className?: string;
}) {
  if (claims.length === 0) return null;
  const rows = sortByRecency(claims);

  return (
    <details
      className={cn(
        "overflow-hidden rounded-2xl border border-border/55 bg-card/45",
        className,
      )}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 px-3.5 text-[13.5px] font-semibold text-foreground/85 [&::-webkit-details-marker]:hidden">
        <History className="h-4 w-4 text-muted-foreground" />
        Historial
        <span className="ml-auto text-xs font-medium text-muted-foreground">
          {rows.length} {rows.length === 1 ? "premio" : "premios"}
        </span>
      </summary>

      <ul>
        {rows.map((c) => {
          const status = effectiveStatus(c);
          const delivered = status === "delivered";
          return (
            <li
              key={c.id}
              className="flex items-center gap-3 border-t border-border/35 px-3.5 py-2.5"
            >
              <div
                className={cn(
                  "h-9 w-9 shrink-0 overflow-hidden rounded-[9px] bg-muted/50",
                  !delivered && "opacity-50",
                )}
              >
                {c.prize.imageUrl && (
                  <img
                    src={cdn(c.prize.imageUrl, 96)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-[13px] font-semibold",
                    delivered ? "text-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {c.prize.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.bar?.name ? `${c.bar.name} · ` : ""}
                  {delivered
                    ? `Entregado el ${formatShortDate(c.deliveredAt ?? c.createdAt)}`
                    : `Venció el ${formatShortDate(c.expiresAt)}`}
                </p>
              </div>
              <span
                className={cn(
                  "ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
                  delivered
                    ? "bg-emerald-500/14 text-emerald-400"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {delivered ? (
                  <CircleCheck className="h-3 w-3" />
                ) : (
                  <CircleSlash className="h-3 w-3" />
                )}
                {delivered ? "Entregado" : "Vencido"}
              </span>
            </li>
          );
        })}
      </ul>

      {truncated && (
        <p className="border-t border-border/35 px-3.5 py-2.5 text-[11px] text-muted-foreground/80">
          Mostramos tus premios más recientes. Los más viejos no aparecen acá.
        </p>
      )}
    </details>
  );
}
