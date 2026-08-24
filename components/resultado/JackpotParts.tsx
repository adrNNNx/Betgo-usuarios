// JackpotParts.tsx — piezas exclusivas de la pantalla de pozo global ganado.
"use client";

import React from "react";
import type { CSSProperties, ReactNode } from "react";
import { jt, jmix, type JackpotStatus } from "./JackpotTheme";
import { IcCheck, IcClock, IcCopy, IcInfo, IcPhone, IcTrophy, IcPin } from "./JackpotIcons";

/* Keyframes propios (se inyectan una sola vez por pantalla). */
export function JackpotKeyframes() {
  return (
    <style>{`
@keyframes jk-spin{to{transform:translateX(-50%) rotate(360deg)}}
@keyframes jk-ping{0%{box-shadow:0 0 0 0 oklch(0.75 0.14 155/.55)}70%,100%{box-shadow:0 0 0 8px oklch(0.75 0.14 155/0)}}
@media (prefers-reduced-motion: reduce){[data-jk-anim]{animation:none!important}}
`}</style>
  );
}

/* --------------------------------------------------------------- RAYOS */
const RAY_STOPS = Array.from({ length: 8 }, (_, i) => {
  const a = i * 22;
  return `oklch(0.78 0.15 85/.13) ${a}deg ${a + 4}deg, transparent ${a + 4}deg ${a + 22}deg`;
}).join(", ");

export function JackpotRays({ dim }: { dim?: boolean }) {
  return (
    <>
      <div style={{
        position: "absolute", inset: "-30% -30% auto", height: 340, pointerEvents: "none", opacity: dim ? 0.5 : 1,
        background: "radial-gradient(60% 70% at 50% 0%, oklch(0.78 0.15 85/.3), transparent 68%)",
      }} />
      {!dim && (
        <div data-jk-anim style={{
          position: "absolute", left: "50%", top: -40, width: 640, height: 640, transform: "translateX(-50%)",
          pointerEvents: "none", animation: "jk-spin 34s linear infinite",
          background: `conic-gradient(from 0deg, ${RAY_STOPS}, transparent 176deg 360deg)`,
          WebkitMaskImage: "radial-gradient(circle at 50% 8%, #000 0%, transparent 62%)",
          maskImage: "radial-gradient(circle at 50% 8%, #000 0%, transparent 62%)",
        } as CSSProperties} />
      )}
    </>
  );
}

/* ---------------------------------------------------------------- HERO */
export function JackpotHero({ amount, venueName, comboLabel, dateLabel, dim }: {
  amount: number; venueName?: string; comboLabel?: string; dateLabel?: string; dim?: boolean;
}) {
  return (
    <div style={{ position: "relative", padding: dim ? "20px 18px 16px" : "26px 18px 22px", textAlign: "center", overflow: "hidden" }}>
      <JackpotRays dim={dim} />
      <div style={{ position: "relative" }}>
        <div style={{
          width: dim ? 48 : 60, height: dim ? 48 : 60, margin: "0 auto", borderRadius: "50%", display: "grid", placeItems: "center",
          background: `linear-gradient(150deg, ${jt.goldHi}, ${jt.goldDeep})`,
          boxShadow: `0 0 0 ${dim ? 5 : 6}px oklch(0.78 0.15 85/.12), 0 10px 30px oklch(0.78 0.15 85/.35)`,
        }}><IcTrophy size={dim ? 24 : 30} color={jt.ink} width={1.85} /></div>

        <Eyebrow>{dim ? "Pozo global ganado" : "Pozo global"}</Eyebrow>

        {!dim && (
          <h1 style={{
            margin: "9px 0 0", font: `italic 900 30px/1.02 ${jt.display}`, letterSpacing: "-.02em", textTransform: "uppercase",
            background: `linear-gradient(180deg, #fff 8%, ${jt.goldHi} 48%, ${jt.goldDeep} 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 3px 14px oklch(0.78 0.15 85/.4))",
          }}>¡Ganaste<br />el jackpot!</h1>
        )}

        {!dim && <div style={{ marginTop: 16, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: jt.muted }}>Monto del pozo</div>}
        <div style={{
          marginTop: dim ? 8 : 3, font: `900 ${dim ? 38 : 46}px/1 ${jt.display}`, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums",
          background: `linear-gradient(135deg, ${jt.gold}, ${jt.goldHi} 45%, ${jt.gold})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 26px oklch(0.78 0.15 85/.35))",
        }}>Gs. {amount.toLocaleString("es-PY")}</div>

        <Pill icon={dim ? <IcClock size={14} /> : <IcPin size={14} />}>
          {dim
            ? <>Ganado el <b style={{ color: jt.gold, fontWeight: 600 }}>{dateLabel}</b></>
            : <>En <b style={{ color: jt.gold, fontWeight: 600 }}>{venueName}</b>{comboLabel ? ` · ${comboLabel}` : ""}</>}
        </Pill>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  const rule = (dir: string): CSSProperties => ({ width: 26, height: 1, background: `linear-gradient(90deg, ${dir})` });
  return (
    <div style={{
      marginTop: 12, display: "inline-flex", alignItems: "center", gap: 9,
      font: `700 10.5px/1 ${jt.body}`, letterSpacing: ".24em", textTransform: "uppercase", color: jt.gold,
    }}>
      <span style={rule(`transparent, ${jt.gold}`)} />{children}<span style={rule(`${jt.gold}, transparent`)} />
    </div>
  );
}

function Pill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div style={{
      marginTop: 9, display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px", borderRadius: 999,
      border: `1px solid ${jmix(jt.gold, 24)}`, background: jmix(jt.gold, 8), fontSize: 11.5, color: jmix(jt.fg, 80),
    }}>{icon}{children}</div>
  );
}

/* -------------------------------------------------------------- TICKET */
export function JackpotTicket({ code, dateLabel, playId, onCopy, children }: {
  code: string; dateLabel: string; playId?: string; onCopy?: () => void; children: ReactNode;
}) {
  const notch: CSSProperties = {
    position: "absolute", top: "50%", width: 22, height: 22, marginTop: -11, borderRadius: "50%",
    background: jt.bg, border: `1px solid ${jmix(jt.gold, 32)}`,
  };
  return (
    <div style={{
      position: "relative", borderRadius: 20,
      background: `linear-gradient(165deg, ${jt.card}, color-mix(in oklch, ${jt.card} 55%, ${jt.bg}))`,
      border: `1px solid ${jmix(jt.gold, 32)}`, boxShadow: "0 12px 40px rgba(0,0,0,.45)",
    }}>
      <div style={{ padding: "16px 16px 14px" }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: jt.muted, textAlign: "center" }}>
          Comprobante de ganador
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 11 }}>
          <div style={{ font: "700 21px/1 ui-monospace, SFMono-Regular, monospace", letterSpacing: ".14em", color: jt.gold }}>{code}</div>
          <button type="button" aria-label="Copiar código" onClick={onCopy} style={{
            width: 40, height: 40, flex: "none", borderRadius: 11, cursor: "pointer",
            border: `1px solid ${jmix(jt.line, 60)}`, background: "transparent", color: jt.muted, display: "grid", placeItems: "center",
          }}><IcCopy /></button>
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <Meta k="Fecha" v={dateLabel} />
          <Meta k="Jugada" v={playId ?? "—"} />
        </div>
      </div>

      <div style={{ position: "relative", height: 22 }}>
        <div style={{ position: "absolute", left: 16, right: 16, top: "50%", borderTop: `1.5px dashed ${jmix(jt.line, 75)}` }} />
        <div style={{ ...notch, left: -12, clipPath: "inset(0 0 0 50%)" }} />
        <div style={{ ...notch, right: -12, clipPath: "inset(0 50% 0 0)" }} />
      </div>

      <div style={{ padding: "2px 16px 16px" }}>{children}</div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ borderRadius: 11, padding: "9px 10px", background: jmix(jt.mutedBg, 60), border: `1px solid ${jmix(jt.line, 40)}` }}>
      <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: jt.muted }}>{k}</div>
      <div style={{ marginTop: 3, font: `600 12.5px/1.3 ${jt.body}` }}>{v}</div>
    </div>
  );
}

/* ------------------------------------------------------------- STEPPER */
const STEPS: [string, string][] = [["Pozo", "ganado"], ["Verificación", "con admin"], ["Pago", "coordinado"]];
const STEP_INDEX: Record<JackpotStatus, number> = { pending_contact: 1, in_review: 2, paid: 3 };

export function JackpotSteps({ status }: { status: JackpotStatus }) {
  const done = STEP_INDEX[status];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
      {STEPS.map(([a, b], i) => {
        const isDone = i < done, isNow = i === done;
        return (
          <div key={a} style={{ textAlign: "center", position: "relative" }}>
            {i < 2 && <span style={{
              position: "absolute", top: 11, left: "calc(50% + 15px)", right: "calc(-50% + 15px)", height: 1,
              background: isDone ? jmix(jt.gold, 55) : jmix(jt.line, 70),
            }} />}
            <div style={{
              width: 22, height: 22, margin: "0 auto", borderRadius: "50%", display: "grid", placeItems: "center",
              font: `700 10px/1 ${jt.display}`,
              background: isDone ? `linear-gradient(135deg, ${jt.goldHi}, ${jt.goldDeep})` : isNow ? jmix(jt.gold, 12) : jt.mutedBg,
              border: `1px solid ${isDone ? "transparent" : isNow ? jt.gold : jmix(jt.line, 70)}`,
              color: isDone ? jt.ink : isNow ? jt.gold : jt.muted,
              boxShadow: isDone ? "0 3px 12px oklch(0.78 0.15 85/.35)" : undefined,
            }}>{isDone ? <IcCheck size={12} width={3} /> : i + 1}</div>
            <div style={{ marginTop: 6, fontSize: 10, lineHeight: 1.3, color: isDone || isNow ? jt.fg : jt.muted }}>{a}<br />{b}</div>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- AVISOS */
export function JackpotNotice({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      marginTop: 14, display: "flex", gap: 9, padding: "11px 12px", borderRadius: 12,
      background: jmix(jt.gold, 8), border: `1px solid ${jmix(jt.gold, 20)}`,
      fontSize: 11.5, lineHeight: 1.5, color: jmix(jt.fg, 82), ...style,
    }}>
      <span style={{ color: jt.gold, marginTop: 1 }}><IcInfo size={14} /></span>
      <div>{children}</div>
    </div>
  );
}

export function JackpotPending({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 13, padding: 11,
      borderRadius: 13, border: `1px dashed ${jmix(jt.gold, 35)}`, fontSize: 12.5, fontWeight: 600, color: jt.gold,
    }}><IcClock size={14} />{children}</div>
  );
}

/* -------------------------------------------------------------- BOTONES */
export function JackpotCta({ children, onClick, href }: { children: ReactNode; onClick?: () => void; href?: string }) {
  const style: CSSProperties = {
    marginTop: 13, width: "100%", minHeight: 54, border: 0, borderRadius: 14, textDecoration: "none",
    background: `linear-gradient(135deg, ${jt.goldHi} 0%, ${jt.gold} 45%, ${jt.goldDeep} 100%)`,
    color: jt.ink, font: `800 15.5px/1 ${jt.display}`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 9, cursor: "pointer",
    boxShadow: "0 8px 26px oklch(0.78 0.15 85/.34), inset 0 1px 0 rgba(255,255,255,.4)",
  };
  const inner = <><IcPhone size={17} width={2.2} />{children}</>;
  return href
    ? <a href={href} target="_blank" rel="noreferrer" style={style}>{inner}</a>
    : <button type="button" onClick={onClick} style={style}>{inner}</button>;
}

export function JackpotGhost({ icon, children, onClick, href, style }: {
  icon?: ReactNode; children: ReactNode; onClick?: () => void; href?: string; style?: CSSProperties;
}) {
  const s: CSSProperties = {
    width: "100%", minHeight: 48, borderRadius: 13, border: `1px solid ${jmix(jt.line, 75)}`, textDecoration: "none",
    background: "transparent", color: jmix(jt.fg, 78), font: `600 14px/1 ${jt.body}`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 9, cursor: "pointer", ...style,
  };
  return href
    ? <a href={href} target="_blank" rel="noreferrer" style={s}>{icon}{children}</a>
    : <button type="button" onClick={onClick} style={s}>{icon}{children}</button>;
}

export function JackpotPlain({ icon, children, onClick }: { icon?: ReactNode; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%", minHeight: 44, border: 0, background: "transparent", color: jt.muted,
      font: `500 13.5px/1 ${jt.body}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
    }}>{icon}{children}</button>
  );
}

/* ------------------------------------------- POZO REINICIADO (secundario) */
export function PozoReset({ amount, balance, costPerPlay, onPlay }: {
  amount: number; balance: number; costPerPlay: number; onPlay?: () => void;
}) {
  const justReset = amount === 0;
  return (
    <section style={{
      borderRadius: 18, padding: 16, border: `1px solid ${jmix(jt.greenBorder, 70)}`,
      background: `linear-gradient(to bottom, ${jt.greenCard}, color-mix(in oklch, ${jt.greenCard} 50%, ${jt.green}))`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 12, fontWeight: 600, color: jt.ok }}>
        <span data-jk-anim style={{ width: 6, height: 6, borderRadius: "50%", background: jt.ok, animation: "jk-ping 2s ease-out infinite" }} />
        {justReset ? "Pozo reiniciado" : "El pozo global ya se está cargando"}
      </div>
      <div style={{
        marginTop: 10, textAlign: "center", font: `900 32px/1 ${jt.display}`, letterSpacing: "-.02em",
        color: justReset ? "oklch(0.86 0.03 150)" : jt.gold,
      }}>Gs. {amount.toLocaleString("es-PY")}</div>
      <div style={{ marginTop: 6, textAlign: "center", fontSize: 11.5, lineHeight: 1.5, color: jt.muted }}>
        {justReset ? "Lo vaciaste vos. Sé el primero en cargarlo otra vez." : "Sube con cada jugada de todos los locales"}
      </div>
      <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <ResetStat k="Tu saldo" v={`Gs. ${balance.toLocaleString("es-PY")}`} color={jt.ok} />
        <ResetStat k="Por jugada" v={`Gs. ${costPerPlay.toLocaleString("es-PY")}`} />
      </div>
      <button type="button" onClick={onPlay} style={{
        marginTop: 13, width: "100%", minHeight: 48, borderRadius: 13,
        border: `1px solid ${jmix(jt.gold, 45)}`, background: jmix(jt.gold, 12), color: jt.gold,
        font: `700 14.5px/1 ${jt.display}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        {justReset ? "Jugar por el pozo nuevo" : "Jugar por el pozo"}
      </button>
    </section>
  );
}

function ResetStat({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div style={{
      borderRadius: 11, padding: "9px 8px", textAlign: "center",
      background: jmix(jt.green, 70), border: `1px solid ${jmix(jt.greenBorder, 45)}`,
    }}>
      <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: jt.muted }}>{k}</div>
      <div style={{ marginTop: 3, font: `700 14px/1.2 ${jt.display}`, fontVariantNumeric: "tabular-nums", color: color ?? jt.fg }}>{v}</div>
    </div>
  );
}

/* ------------------------------------------------------------ SEPARADOR */
export function JackpotSep({ label }: { label: string }) {
  const line: CSSProperties = { flex: 1, height: 1, background: jmix(jt.line, 55) };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 4 }}>
      <span style={line} />
      <span style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: jt.muted }}>{label}</span>
      <span style={line} />
    </div>
  );
}
