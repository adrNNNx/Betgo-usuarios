// components/slot-machine/PayoutTable.tsx
"use client";

import type { BarSymbolResponse } from "@/services/game.service";
import { cn } from "@/lib/utils";
import { cdn } from "@/lib/cdn";

interface PayoutTableProps {
  symbols: BarSymbolResponse[];
  /** En modo pozo los símbolos globales pagan el pozo; en el bar nunca */
  showJackpot?: boolean;
  className?: string;
}

/**
 * Tabla de pagos: desde cuántos carriles iguales paga cada símbolo.
 *
 * Se muestra sólo si el backend manda `minMatchToWin` (ver TODO-BACKEND.md).
 * Sin ese dato no se puede decir la verdad, así que no se muestra nada.
 */
export function PayoutTable({
  symbols,
  showJackpot = false,
  className,
}: PayoutTableProps) {
  const payable = symbols
    // Los símbolos de pozo no tienen premio propio: sólo pagan donde el pozo
    // se puede ganar. En las jugadas del bar no entregan nada, no van en la tabla.
    .filter(
      (s) => s.minMatchToWin != null && (s.isJackpot ? showJackpot : s.hasPrize),
    )
    .sort(
      (a, b) =>
        (a.minMatchToWin ?? 5) - (b.minMatchToWin ?? 5) ||
        a.name.localeCompare(b.name),
    );

  if (payable.length === 0) return null;

  return (
    // ponytail: <details> nativo, sin estado ni librería de accordion
    <details
      className={cn(
        "w-full max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm",
        className,
      )}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-primary select-none">
        ¿Cómo se gana?
        <span className="ml-2 font-normal text-muted-foreground">
          Tabla de pagos
        </span>
      </summary>

      <ul className="divide-y divide-border/30 border-t border-border/30">
        {payable.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
            {s.imageUrl && (
              <img
                src={cdn(s.imageUrl, 96)}
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
                crossOrigin="anonymous"
              />
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm text-foreground">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.isJackpot ? "Pozo global acumulado" : s.prizeName ?? "Premio"}
              </p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground sm:text-sm">
              desde{" "}
              <span className="font-bold text-primary">{s.minMatchToWin}</span>{" "}
              iguales
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-border/30 px-4 py-2.5 text-[11px] text-muted-foreground/70">
        {showJackpot
          ? "El pozo global exige los 5 carriles. Los demás premios pagan desde su propio mínimo."
          : "Las jugadas del bar no entregan el pozo global."}
      </p>
    </details>
  );
}
