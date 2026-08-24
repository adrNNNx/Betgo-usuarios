// ResultadoScreen.tsx — pantalla de fin de jugada.
// Orden intencional: (1) se reconoce el premio en una tira compacta,
// (2) el POZO GLOBAL es la acción principal, (3) el premio + QR quedan abajo.
"use client";

import React, { useRef } from "react";
import type { ReactNode } from "react";
import { IcArrowLeft, IcCard } from "./ResultadoIcons";
import { JackpotScreen, type JackpotScreenProps } from "./JackpotScreen";
import {
  ResultadoShell, VenueChip, WinBanner, WinBannerNote, PozoHero, SectionSep,
  PrizeCard, GhostButton, PlainButton, NoPrizeHead,
} from "./ResultadoParts";

export type { JackpotScreenProps };

export interface PremioGanado {
  name: string;
  imageUrl?: string | null;
  /** Código de reclamo, ej. "P-XK9B7CQC" */
  code: string;
  /** Tu <QRCodeDisplay value={...} /> real. */
  qr?: ReactNode;
  /** Ej. "5 iguales de Trébol" */
  comboLabel?: string;
  /** Ej. "Tenés 7 días para reclamarlo" */
  expiryLabel?: string;
  urgent?: boolean;
}

/** Datos del pozo ganado. La pantalla del jackpot es aparte: ver JackpotScreen.tsx. */
export type JackpotGanado = Omit<
  JackpotScreenProps,
  "header" | "pool" | "onPlayPool" | "onMyPrizes" | "onHome" | "onCopyCode"
>;

export type ResultadoOutcome =
  | { kind: "prize"; prize: PremioGanado }
  | { kind: "jackpot"; jackpot: JackpotGanado }
  /**
   * Sin premio. El encabezado se puede sobreescribir porque el motivo cambia
   * según el modo: en gratis "se acabaron las jugadas", en pozo "saldo insuficiente".
   */
  | { kind: "none"; title?: string; sub?: string; note?: ReactNode };

export interface ResultadoScreenProps {
  /** Tu header real (logo + saldo + avatar). */
  header?: ReactNode;
  venue: { name: string; logoUrl?: string | null };
  outcome: ResultadoOutcome;
  pool: {
    amount: number;
    balance: number;
    costPerPlay: number;
    /** "reset" cuando el usuario acaba de ganar el pozo. Se deduce del outcome si no lo pasás. */
    state?: "live" | "reset";
  };
  playing?: boolean;
  onPlayPool: () => void;
  onTopUp?: () => void;
  onMyPrizes?: () => void;
  onHome?: () => void;
  onCopyCode?: (code: string) => void;
}

export function ResultadoScreen({
  header, venue, outcome, pool, playing, onPlayPool, onTopUp, onMyPrizes, onHome, onCopyCode,
}: ResultadoScreenProps) {
  const prizeRef = useRef<HTMLDivElement>(null);
  const canPlay = pool.balance >= pool.costPerPlay;
  const poolState = pool.state ?? "live";

  // El pozo ganado tiene identidad propia: se delega a JackpotScreen.
  if (outcome.kind === "jackpot") {
    return (
      <JackpotScreen
        {...outcome.jackpot}
        header={header}
        venueName={outcome.jackpot.venueName ?? venue.name}
        pool={pool}
        onPlayPool={onPlayPool}
        onMyPrizes={onMyPrizes}
        onHome={onHome}
        onCopyCode={onCopyCode}
      />
    );
  }

  const scrollToPrize = () => {
    const el = prizeRef.current;
    if (!el) return;
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 12, behavior: "smooth" });
  };

  return (
    <ResultadoShell header={header}>
      <VenueChip name={venue.name} logoUrl={venue.logoUrl} />

      {/* 1 · Reconocimiento del resultado */}
      {outcome.kind === "prize" && (
        <WinBanner
          title="¡Ganaste!"
          name={outcome.prize.name}
          sub={outcome.prize.comboLabel}
          imageUrl={outcome.prize.imageUrl}
          footer={<WinBannerNote text="Guardado en Mis Premios" actionLabel="Ver detalle" onAction={scrollToPrize} />}
        />
      )}
      {outcome.kind === "none" && (
        <NoPrizeHead
          title={outcome.title ?? "Se acabaron las jugadas gratis"}
          sub={outcome.sub ?? "Pero el pozo global sigue abierto"}
          note={outcome.note}
        />
      )}

      {/* 2 · Acción principal: seguir jugando el pozo */}
      <PozoHero
        poolAmount={pool.amount}
        balance={pool.balance}
        costPerPlay={pool.costPerPlay}
        state={poolState}
        onPlay={onPlayPool}
        onTopUp={onTopUp}
        loading={playing}
      />

      {/* 3 · El premio y sus datos */}
      {outcome.kind === "prize" && (
        <>
          <SectionSep label="Tu premio" />
          <div ref={prizeRef}>
            <PrizeCard
              name={outcome.prize.name}
              imageUrl={outcome.prize.imageUrl}
              venueName={venue.name}
              expiryLabel={outcome.prize.expiryLabel}
              urgent={outcome.prize.urgent}
              code={outcome.prize.code}
              qr={outcome.prize.qr}
              onCopyCode={() => onCopyCode?.(outcome.prize.code)}
            />
          </div>
        </>
      )}

      {/* 4 · Salidas secundarias */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {canPlay && onTopUp ? (
          <GhostButton icon={<IcCard />} onClick={onTopUp}>Cargar más saldo</GhostButton>
        ) : null}
        <PlainButton icon={<IcArrowLeft size={14} />} onClick={onHome}>Volver al inicio</PlainButton>
      </div>
    </ResultadoShell>
  );
}

export default ResultadoScreen;
