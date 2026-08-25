// JackpotScreen.tsx — pantalla de POZO GLOBAL GANADO.
// Es la única pantalla del sistema con esta identidad (casi negro + dorado + rayos).
// Regla de negocio: el pozo NO se acredita al saldo. Se emite un comprobante con
// folio y el usuario debe contactar a administración para coordinar el retiro.
"use client";

import React from "react";
import type { ReactNode } from "react";
import { jt, type JackpotStatus } from "./JackpotTheme";
import { IcArrowLeft, IcGift, IcPhone } from "./JackpotIcons";
import {
  JackpotKeyframes, JackpotHero, JackpotTicket, JackpotSteps, JackpotNotice, JackpotPending,
  JackpotCta, JackpotGhost, JackpotPlain, JackpotSep, PozoReset,
} from "./JackpotParts";

export interface JackpotScreenProps {
  /** Tu header real (logo + saldo + avatar). */
  header?: ReactNode;
  /** Monto del pozo ganado, en guaraníes. */
  amount: number;
  /** Folio del comprobante, ej. "J-4XPQ2M". */
  code: string;
  /** Ya formateada, ej. "12/08/2026 · 20:41". */
  dateLabel: string;
  /** Sólo la fecha, para el estado "en verificación". Default: dateLabel. */
  shortDateLabel?: string;
  playId?: string;
  venueName?: string;
  /** Ej. "5 iguales de Trébol". */
  comboLabel?: string;
  /** pending_contact = recién ganado · in_review = ya contactó · paid = pagado. */
  status?: JackpotStatus;
  /** Link directo (wa.me / tel:). Si lo pasás, el CTA es un <a>. */
  contactHref?: string;
  onContact?: () => void;
  onCopyCode?: (code: string) => void;
  pool: { amount: number; balance: number; costPerPlay: number };
  onPlayPool?: () => void;
  onMyPrizes?: () => void;
  onHome?: () => void;
}

export function JackpotScreen({
  header, amount, code, dateLabel, shortDateLabel, playId, venueName, comboLabel,
  status = "pending_contact", contactHref, onContact, onCopyCode,
  pool, onPlayPool, onMyPrizes, onHome,
}: JackpotScreenProps) {
  const fresh = status === "pending_contact";

  return (
    <div style={{ background: jt.bg, color: jt.fg, fontFamily: jt.body, minHeight: "100dvh" }}>
      <JackpotKeyframes />
      <div data-jk-scale style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ position: "relative", zIndex: 2 }}>{header}</div>

        <JackpotHero
          amount={amount}
          venueName={venueName}
          comboLabel={comboLabel}
          dateLabel={shortDateLabel ?? dateLabel}
          dim={!fresh}
        />

        <div style={{ padding: "0 16px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
          <JackpotTicket
            code={code}
            dateLabel={dateLabel}
            playId={playId}
            onCopy={() => onCopyCode?.(code)}
          >
            <JackpotSteps status={status} />

            {fresh ? (
              <>
                <JackpotNotice>
                  El pozo global <b style={{ color: jt.gold, fontWeight: 600 }}>no se acredita al saldo</b>. Contactá a
                  administración con este código para validar la jugada y coordinar el retiro.
                </JackpotNotice>
                <JackpotCta href={contactHref} onClick={onContact}>Contactar a administración</JackpotCta>
                <div style={{ marginTop: 9, textAlign: "center", fontSize: 11, lineHeight: 1.5, color: jt.muted }}>
                  Guardá el código <b style={{ color: jt.gold }}>{code}</b> — también quedó en Mis Premios
                </div>
              </>
            ) : status === "in_review" ? (
              <>
                <JackpotPending>Administración está validando tu jugada</JackpotPending>
                <JackpotNotice style={{ marginTop: 10 }}>
                  Te van a escribir para coordinar el retiro. Si pasaron más de <b style={{ color: jt.gold, fontWeight: 600 }}>48 h</b>,
                  volvé a escribirnos con el mismo código.
                </JackpotNotice>
                <JackpotGhost href={contactHref} onClick={onContact} icon={<IcPhone />} style={{ marginTop: 12 }}>
                  Volver a contactar
                </JackpotGhost>
              </>
            ) : (
              <>
                <JackpotPending>Retiro coordinado — premio entregado</JackpotPending>
                <JackpotNotice style={{ marginTop: 10 }}>
                  Este comprobante queda como registro de tu jugada ganadora.
                </JackpotNotice>
              </>
            )}
          </JackpotTicket>

          <JackpotSep label={fresh ? "El pozo arranca de nuevo" : "Mientras tanto"} />

          <PozoReset
            amount={pool.amount}
            balance={pool.balance}
            costPerPlay={pool.costPerPlay}
            onPlay={onPlayPool}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {fresh && onMyPrizes && (
              <JackpotGhost icon={<IcGift />} onClick={onMyPrizes}>Ver mis premios</JackpotGhost>
            )}
            <JackpotPlain icon={<IcArrowLeft size={14} />} onClick={onHome}>Volver al inicio</JackpotPlain>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JackpotScreen;
