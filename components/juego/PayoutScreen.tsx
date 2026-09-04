// implementacion/juego/PayoutScreen.tsx
"use client";

import { cdn } from "@/lib/cdn";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import { formatCompact } from "./juego-theme";
import type { BarSymbolResponse } from "@/services/game.service";

type Mode = "free" | "pool";

const AC = {
  free: {
    key: "oklch(0.74 0.15 158)",
    label: "oklch(0.84 0.13 158)",
    aura: "radial-gradient(120% 55% at 50% 0%, oklch(0.74 0.15 158 / 0.10), transparent 60%)",
  },
  pool: {
    key: "oklch(0.72 0.15 85)",
    label: "oklch(0.88 0.15 86)",
    aura: "radial-gradient(120% 55% at 50% 0%, oklch(0.72 0.15 85 / 0.13), transparent 60%)",
  },
} as const;

/** Diagrama de los 5 carriles con N encendidos. */
function Lanes({ n, mode, size = 1 }: { n: number; mode: Mode; size?: number }) {
  return (
    <div className="flex" style={{ gap: 3 * size }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="block rounded-[3px]"
          style={{
            width: 13 * size,
            height: 14 * size,
            background:
              i < n
                ? `color-mix(in oklch, ${AC[mode].key} ${mode === "pool" ? 60 : 55}%, transparent)`
                : "oklch(0.26 0.03 160)",
          }}
        />
      ))}
    </div>
  );
}

function SymbolRow({ symbol, mode }: { symbol: BarSymbolResponse; mode: Mode }) {
  return (
    <div
      className="flex items-center gap-[11px] rounded-xl px-[11px] py-2.5"
      style={{
        border: "1px solid oklch(0.35 0.02 160 / 0.4)",
        background: "oklch(0.26 0.04 160 / 0.45)",
      }}
    >
      <div
        className="grid h-[38px] w-[38px] flex-none place-items-center overflow-hidden rounded-[10px] text-[19px]"
        style={{
          background: "oklch(0.28 0.02 160)",
          border: "1px solid oklch(0.35 0.02 160 / 0.5)",
        }}
      >
        {symbol.imageUrl ? (
          <img
            src={cdn(symbol.imageUrl, 96)}
            alt={symbol.name}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <span className="leading-none">🎁</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-display text-[13px] font-bold leading-tight">{symbol.name}</div>
        {symbol.prizeName && (
          <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
            {symbol.prizeName}
          </div>
        )}
      </div>

      {symbol.prizeValue != null && symbol.prizeValue > 0 && (
        <div
          className="flex-none font-display text-[12px] font-bold tabular-nums"
          style={{ color: AC[mode].label }}
        >
          {formatCompact(symbol.prizeValue)}
        </div>
      )}
    </div>
  );
}

interface PayoutScreenProps {
  mode: Mode;
  /** Símbolos del modo: rawBarSymbols en free, rawPoolSymbols en pool. */
  symbols: BarSymbolResponse[];
  /** Nombre del bar — sólo se muestra en free. */
  barName?: string;
  poolAmount: number;
  costPerPlay: number;
  onBack: () => void;
  /** free: abrir el pozo. pool: jugar. */
  onPrimary: () => void;
  className?: string;
}

/**
 * Pantalla "¿Cómo se gana?" — una por modo. Reemplazó al <details> de la
 * vieja PayoutTable, que quedó borrada.
 *
 * El acordeón resolvía el dato pero no la pregunta: no dice cuántos premios
 * hay, no agrupa, y en un bar con doce símbolos es una lista plana. Acá los
 * premios se agrupan por minMatchToWin, cada grupo lleva su diagrama de
 * carriles, y el pozo (isJackpot) sale de la lista y sube a su propio card.
 *
 * Free abre con la explicación y cierra con la banda del pozo; pool abre con
 * el pozo y cierra con el botón de jugar. Misma estructura, distinto acento,
 * distinto orden.
 */
export function PayoutScreen({
  mode,
  symbols,
  barName,
  poolAmount,
  costPerPlay,
  onBack,
  onPrimary,
  className,
}: PayoutScreenProps) {
  const ac = AC[mode];
  // El símbolo del pozo NO tiene premio propio (`hasPrize: false`, invariante
  // del backend): se busca aparte o no aparece nunca. El resto son los que
  // pagan premio de catálogo; en free los de pozo tampoco pagan.
  const jackpot = symbols.find((s) => s.isJackpot);
  const payable = symbols.filter((s) => s.hasPrize && !s.isJackpot);

  // Agrupado por mínimo de iguales, ascendente: lo fácil primero.
  const groups = Array.from(
    payable.reduce((map, s) => {
      const k = s.minMatchToWin ?? 3;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
      return map;
    }, new Map<number, BarSymbolResponse[]>()),
  ).sort((a, b) => (mode === "pool" ? b[0] - a[0] : a[0] - b[0]));

  const demoMatch = mode === "pool" ? 5 : (groups[0]?.[0] ?? 3);
  const demoSymbol = mode === "pool" ? jackpot : groups[0]?.[1]?.[0];

  return (
    <div
      className={cn("flex min-h-screen flex-col items-center p-4 sm:p-6", className)}
      style={{ background: `${ac.aura}, oklch(0.2 0.05 160)` }}
    >
      <div className="flex w-full max-w-2xl flex-col gap-[13px]">
        {/* ---- Encabezado ---- */}
        <div className="flex items-start gap-[11px]">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] text-[15px] text-muted-foreground"
            style={{
              border: "1px solid oklch(0.35 0.02 160 / 0.6)",
              background: "oklch(0.26 0.04 160 / 0.6)",
            }}
          >
            ←
          </button>
          <div>
            <h1 className="font-display text-[22px] font-black leading-tight tracking-[-0.02em]">
              ¿Cómo se gana?
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span
                className="font-display text-[8.5px] font-bold uppercase tracking-[0.18em]"
                style={{ color: mode === "pool" ? ac.label : ac.key }}
              >
                {mode === "pool"
                  ? "Pozo global · premios de todos los bares"
                  : `Jugadas gratis${barName ? ` · ${barName}` : ""}`}
              </span>
            </div>
          </div>
        </div>

        {/* ---- Card del pozo: sólo en pool, y va primero ---- */}
        {mode === "pool" && (
          <div
            className="relative overflow-hidden rounded-2xl p-3.5"
            style={{
              border: "1px solid oklch(0.72 0.15 85 / 0.45)",
              background:
                "radial-gradient(115% 95% at 20% -10%, oklch(0.72 0.15 85 / 0.22), transparent 62%), linear-gradient(to bottom, oklch(0.26 0.04 160), oklch(0.23 0.045 160))",
              boxShadow: "0 10px 34px oklch(0.72 0.15 85 / 0.14)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span
                className="font-display text-[8.5px] font-bold uppercase tracking-[0.2em]"
                style={{ color: ac.label }}
              >
                El pozo acumulado
              </span>
            </div>

            <div
              className="mt-[7px] font-display text-[26px] font-black leading-none tabular-nums"
              style={{
                letterSpacing: "-0.03em",
                background:
                  "linear-gradient(135deg, oklch(0.74 0.15 85), oklch(0.86 0.18 88), oklch(0.74 0.15 85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatCurrency(poolAmount)}
            </div>

            <div className="mt-[11px] flex items-center gap-[9px]">
              <Lanes n={5} mode="pool" size={1.22} />
              <span className="text-[10.5px] text-muted-foreground">
                Exige los{" "}
                <b className="font-semibold" style={{ color: ac.label }}>
                  {jackpot?.minMatchToWin ?? 5} carriles
                </b>
                {jackpot ? ` con ${jackpot.name}` : null}
              </span>
            </div>
          </div>
        )}

        {/* ---- Explicación + demo ---- */}
        <div
          className="rounded-[14px] px-[13px] py-3 text-[11.5px] leading-relaxed"
          style={{
            border: "1px solid oklch(0.35 0.02 160 / 0.45)",
            background: "oklch(0.26 0.04 160 / 0.55)",
            color: "oklch(0.7 0.02 160)",
          }}
        >
          {mode === "pool" ? (
            <>Los demás premios globales pagan desde su propio mínimo, en la línea del medio.</>
          ) : (
            <>
              Ganás cuando caen{" "}
              <b className="font-semibold text-foreground">varios símbolos iguales</b> en la
              línea del medio. Cada premio pide su propio mínimo.
            </>
          )}

          <div className="mt-[9px] flex gap-[5px]">
            {Array.from({ length: 5 }).map((_, i) => {
              const on = i < demoMatch;
              return (
                <div
                  key={i}
                  className="grid flex-1 place-items-center overflow-hidden rounded-[7px] text-[15px]"
                  style={{
                    aspectRatio: "1 / 1.05",
                    background: on
                      ? `color-mix(in oklch, ${ac.key} 12%, oklch(0.23 0.04 160))`
                      : "oklch(0.23 0.04 160)",
                    outline: on ? `1px solid color-mix(in oklch, ${ac.key} 60%, transparent)` : undefined,
                    opacity: on ? 1 : 0.3,
                    filter: on ? undefined : "grayscale(0.6)",
                    boxShadow: "inset 0 1px 5px oklch(0 0 0 / 0.45)",
                  }}
                >
                  {on && demoSymbol?.imageUrl ? (
                    <img
                      src={cdn(demoSymbol.imageUrl, 64)}
                      alt=""
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="leading-none">{on ? "🎁" : "·"}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- Grupos por mínimo de iguales ---- */}
        {groups.map(([min, list]) => (
          <div key={min}>
            <div className="mb-2 flex items-center gap-[9px]">
              <Lanes n={min} mode={mode} />
              <span
                className="whitespace-nowrap font-display text-[9px] font-black uppercase tracking-[0.18em]"
                style={{ color: ac.label }}
              >
                Con {min} iguales
              </span>
              <span
                className="h-px flex-1"
                style={{ background: "oklch(0.35 0.02 160 / 0.55)" }}
              />
            </div>
            <div className="flex flex-col gap-[7px]">
              {list
                .sort((a, b) => (a.prizeValue ?? 0) - (b.prizeValue ?? 0))
                .map((s) => (
                  <SymbolRow key={s.id} symbol={s} mode={mode} />
                ))}
            </div>
          </div>
        ))}

        {/* ---- Pie ---- */}
        <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {mode === "pool"
            ? "El pozo se acumula con cada jugada paga de todos los bares. Los premios globales se coordinan con administración."
            : "Los premios del bar se retiran en barra con el código de tu jugada. Las jugadas del bar no entregan el pozo global."}
        </p>

        {/* ---- Cierre: free → banda del pozo, pool → jugar ---- */}
        {mode === "free" ? (
          <PoolBandInline
            poolAmount={poolAmount}
            jackpotMatch={jackpot?.minMatchToWin ?? 5}
            onClick={onPrimary}
          />
        ) : (
          <button
            onClick={onPrimary}
            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] font-display text-[16px] font-extrabold uppercase tracking-[0.04em]"
            style={{
              background: "linear-gradient(135deg, oklch(0.78 0.16 88), oklch(0.68 0.15 80))",
              color: "oklch(0.2 0.05 160)",
              boxShadow: "0 6px 22px oklch(0.72 0.15 85 / 0.32)",
            }}
          >
            ⚡ Jugar · {formatCurrency(costPerPlay)}
          </button>
        )}

        <button onClick={onBack} className="self-center text-[12px] text-muted-foreground">
          ← Volver a {mode === "pool" ? "la máquina" : "jugar"}
        </button>
      </div>
    </div>
  );
}

/**
 * Variante de PoolBand con copy propio del contexto de la tabla: acá el
 * usuario ya está leyendo reglas, así que el subtítulo explica la regla del
 * pozo en vez del costo por jugada.
 */
function PoolBandInline({
  poolAmount,
  jackpotMatch,
  onClick,
}: {
  poolAmount: number;
  jackpotMatch: number;
  onClick: () => void;
}) {
  if (poolAmount <= 0) return null;
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-[13px] px-3 py-2.5 pl-[13px] text-left"
      style={{
        border: "1px solid oklch(0.72 0.15 85 / 0.34)",
        background:
          "linear-gradient(100deg, oklch(0.72 0.15 85 / 0.13), oklch(0.26 0.04 160) 70%)",
      }}
    >
      <span className="relative min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span
            className="font-display text-[8.5px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "oklch(0.88 0.15 86)" }}
          >
            Pozo global
          </span>
        </span>
        <span
          className="mt-[3px] block font-display text-[19px] font-extrabold leading-none tabular-nums"
          style={{ letterSpacing: "-0.02em", color: "oklch(0.84 0.17 86)" }}
        >
          {formatCurrency(poolAmount)}
        </span>
        <span className="mt-[3px] block text-[10.5px] text-muted-foreground">
          Se gana con {jackpotMatch} símbolos globales iguales
        </span>
      </span>
      <span
        className="relative flex h-[34px] flex-none items-center gap-1.5 rounded-[10px] px-[13px] font-display text-[11.5px] font-extrabold uppercase tracking-[0.04em]"
        style={{
          background: "linear-gradient(135deg, oklch(0.76 0.16 88), oklch(0.68 0.15 82))",
          color: "oklch(0.2 0.05 160)",
          boxShadow: "0 4px 14px oklch(0.72 0.15 85 / 0.28)",
        }}
      >
        Ver
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}
