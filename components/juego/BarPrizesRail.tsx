// implementacion/juego/BarPrizesRail.tsx
"use client";

import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import { formatCompact } from "./juego-theme";
import type { PrizeItem } from "@/services/prize.service";

function fallbackEmoji(prize: PrizeItem): string {
  const n = prize.name.toLowerCase();
  if (n.includes("cerveza") || n.includes("chop") || n.includes("beer")) return "🍺";
  if (n.includes("trago") || n.includes("copa") || n.includes("drink")) return "🍹";
  if (n.includes("papas") || n.includes("fritas")) return "🍟";
  if (n.includes("pizza") || n.includes("picada") || n.includes("comida")) return "🍕";
  if (n.includes("entrada") || n.includes("vip") || n.includes("show")) return "🎟️";
  if (n.includes("iphone") || n.includes("celular")) return "📱";
  if (n.includes("efectivo") || n.includes("dinero")) return "💵";
  return "🎁";
}

interface BarPrizesRailProps {
  prizes: PrizeItem[];
  /** Mínimo de carriles iguales por premio, si el backend lo manda. */
  minMatchByPrizeId?: Record<string, number>;
  /** Cuántas tarjetas antes del "+N". Default 5. */
  visible?: number;
  onSeeAll: () => void;
  className?: string;
}

/**
 * Riel horizontal con los premios del bar.
 *
 * Antes era una grilla fija de 3: un bar con doce premios mostraba tres y
 * mentía por omisión. Ahora se deslizan todos, cada tarjeta dice cuántos
 * iguales pide, y la última cuenta lo que queda y abre la tabla de pagos.
 * El riel no crece en alto, así que la máquina no se va de pantalla por
 * más premios que cargue el bar.
 */
export function BarPrizesRail({
  prizes,
  minMatchByPrizeId,
  visible = 5,
  onSeeAll,
  className,
}: BarPrizesRailProps) {
  const items = prizes
    .filter((p) => p.isActive && p.type !== "jackpot")
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

  if (items.length === 0) return null;

  const shown = items.slice(0, visible);
  const rest = items.length - shown.length;

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="flex items-baseline justify-between gap-2.5 px-0.5">
        <span
          className="whitespace-nowrap font-display text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "oklch(0.82 0.13 158)" }}
        >
          Premios de este bar
        </span>
        <button
          onClick={onSeeAll}
          className="whitespace-nowrap text-[10.5px] text-muted-foreground"
        >
          <b className="font-semibold" style={{ color: "oklch(0.82 0.13 158)" }}>
            {items.length} premios
          </b>{" "}
          · Ver tabla →
        </button>
      </div>

      <div
        className="mt-2 flex gap-[9px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {shown.map((prize) => {
          const min = minMatchByPrizeId?.[prize.id];
          return (
            <div
              key={prize.id}
              className="flex-none basis-[104px] rounded-[13px] px-[9px] py-2.5 text-center"
              style={{
                scrollSnapAlign: "start",
                border: "1px solid oklch(0.35 0.02 160 / 0.55)",
                background: "oklch(0.26 0.04 160 / 0.75)",
              }}
            >
              <div
                className="grid aspect-square w-full place-items-center overflow-hidden rounded-[9px] text-[22px]"
                style={{ background: "oklch(0.28 0.02 160)" }}
              >
                {prize.imageUrl ? (
                  <img
                    src={cdn(prize.imageUrl, 128)}
                    alt={prize.name}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                ) : (
                  <span className="select-none leading-none">{fallbackEmoji(prize)}</span>
                )}
              </div>
              <div className="mt-[7px] font-display text-[11px] font-bold leading-tight text-pretty">
                {prize.name}
              </div>
              {prize.value != null && prize.value > 0 && (
                <div className="mt-0.5 text-[9.5px] text-muted-foreground">
                  {formatCompact(prize.value)}
                </div>
              )}
              {min != null && (
                <div
                  className="mt-1.5 inline-block rounded-full px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    color: "oklch(0.84 0.12 158)",
                    background: "oklch(0.74 0.15 158 / 0.14)",
                    border: "1px solid oklch(0.74 0.15 158 / 0.26)",
                  }}
                >
                  {min} iguales
                </div>
              )}
            </div>
          );
        })}

        {rest > 0 && (
          <button
            onClick={onSeeAll}
            className="grid flex-none basis-[104px] place-items-center rounded-[13px] px-[9px] py-2.5"
            style={{
              scrollSnapAlign: "start",
              border: "1px dashed oklch(0.35 0.02 160 / 0.55)",
              background: "oklch(0.26 0.04 160 / 0.45)",
            }}
          >
            <span>
              <span
                className="block font-display text-[20px] font-black leading-none"
                style={{ color: "oklch(0.84 0.12 158)" }}
              >
                +{rest}
              </span>
              <span className="mt-1.5 block text-[10px] leading-snug text-muted-foreground">
                Ver todos
                <br />
                en la tabla
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
