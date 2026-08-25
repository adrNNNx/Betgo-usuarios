// ResultadoParts.tsx — piezas de la pantalla de resultado.
"use client";

import React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cdn } from "@/lib/cdn";
import { rt, mix, fmtGs } from "./ResultadoTheme";
import { IcBolt, IcCheck, IcClock, IcCopy, IcArrowDown, IcCard } from "./ResultadoIcons";

/* Keyframes globales (se inyectan una sola vez). */
export function ResultadoKeyframes() {
  return (
    <style>{`
@keyframes bg-sheen{0%{transform:translateX(-70%)}60%,100%{transform:translateX(70%)}}
@keyframes bg-ping{0%{box-shadow:0 0 0 0 oklch(0.75 0.14 155/.55)}70%,100%{box-shadow:0 0 0 8px oklch(0.75 0.14 155/0)}}
@media (prefers-reduced-motion: reduce){[data-bg-anim]{animation:none!important}}
/* La columna está calibrada para el celular. En pantallas grandes se escala
   entera en vez de rediseñarla: mismas proporciones, tamaño cómodo. */
@media (min-width:1024px){[data-rs-scale]{zoom:1.18}}
@media (min-width:1536px){[data-rs-scale]{zoom:1.32}}
`}</style>
  );
}

/* ------------------------------------------------------------- SHELL */
export function ResultadoShell({ header, children }: { header?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ background: rt.bg, color: rt.fg, fontFamily: rt.body, minHeight: "100dvh" }}>
      <ResultadoKeyframes />
      <div data-rs-scale style={{ maxWidth: 440, margin: "0 auto" }}>
        {header}
        <div style={{ padding: "14px 16px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- VENUE CHIP */
export function VenueChip({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div style={{
      alignSelf: "center", display: "flex", alignItems: "center", gap: 10,
      padding: "7px 16px 7px 8px", borderRadius: 999,
      border: `1px solid ${mix(rt.primary, 26)}`, background: `color-mix(in oklch, ${rt.card} 80%, transparent)`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flex: "none",
        background: rt.mutedBg, border: `1px solid ${mix(rt.primary, 30)}`,
        display: "grid", placeItems: "center", fontFamily: rt.display, fontWeight: 700, fontSize: 9, color: rt.primary,
      }}>
        {logoUrl ? <img src={cdn(logoUrl, 96)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : name.slice(0, 3).toUpperCase()}
      </div>
      <span style={{ fontFamily: rt.display, fontWeight: 700, fontSize: 14, color: rt.primary }}>{name}</span>
    </div>
  );
}

/* ------------------------------------------------------ IMAGEN PREMIO */
export function PrizeImage({ src, alt, size = 60, radius = 14 }: { src?: string | null; alt?: string; size?: number; radius?: number }) {
  const base: CSSProperties = {
    width: size, height: size, flex: "none", borderRadius: radius, overflow: "hidden",
    background: rt.mutedBg, border: `1px solid ${mix(rt.primary, 25)}`, display: "grid", placeItems: "center",
  };
  if (src) return <div style={base}><img src={cdn(src, size * 2)} alt={alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>;
  return (
    <div style={{
      ...base, fontSize: 8, lineHeight: 1.3, fontFamily: "ui-monospace, monospace", color: rt.muted,
      textAlign: "center", padding: 5,
      backgroundImage: `repeating-linear-gradient(45deg, transparent 0 5px, ${mix(rt.border, 40)} 5px 6px)`,
    }}>sin<br />imagen</div>
  );
}

/* --------------------------------------------------------- WIN BANNER */
export function WinBanner({ title, name, sub, imageUrl, badge, footer }: {
  title: string; name: string; sub?: string; imageUrl?: string | null; badge?: string;
  footer?: ReactNode;
}) {
  return (
    <div style={{
      position: "relative", borderRadius: 18, overflow: "hidden",
      border: `1px solid ${mix(rt.primary, 35)}`,
      background: `linear-gradient(160deg, ${mix(rt.primary, 14)}, ${rt.card} 62%)`,
      backgroundColor: rt.card,
    }}>
      <div data-bg-anim style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(100deg, transparent 35%, oklch(0.85 0.14 85/.13) 50%, transparent 65%)",
        animation: "bg-sheen 3.4s ease-in-out infinite",
      }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 13, padding: 14 }}>
        {badge ? (
          <div style={{
            width: 60, height: 60, flex: "none", borderRadius: 14, display: "grid", placeItems: "center",
            background: rt.mutedBg, border: `1px solid ${mix(rt.primary, 45)}`,
            fontFamily: rt.display, fontWeight: 800, fontSize: 11, color: rt.primary,
          }}>{badge}</div>
        ) : <PrizeImage src={imageUrl} alt={name} />}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: rt.display, fontWeight: 800, fontSize: 21, lineHeight: 1.1, letterSpacing: "-.01em" }}>{title}</h1>
          <div style={{ marginTop: 4, fontFamily: rt.display, fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: rt.primary, textWrap: "pretty" }}>{name}</div>
          {sub && <div style={{ marginTop: 3, fontSize: 11.5, color: rt.muted }}>{sub}</div>}
        </div>
      </div>
      {footer}
    </div>
  );
}

/** Franja inferior verde del WinBanner. */
export function WinBannerNote({ text, actionLabel, onAction }: { text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
      borderTop: `1px solid ${mix(rt.primary, 18)}`, background: "oklch(0.75 0.14 155/.09)",
      fontSize: 11.5, color: "oklch(0.8 0.11 155)", position: "relative",
    }}>
      <IcCheck size={14} />
      <span>{text}</span>
      {actionLabel && (
        <button type="button" onClick={onAction} style={{
          marginLeft: "auto", border: 0, background: "transparent", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 4, font: `600 11.5px/1 ${rt.body}`, color: "oklch(0.8 0.11 155)",
        }}>{actionLabel}<IcArrowDown size={14} /></button>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- POZO HERO */
export interface PozoHeroProps {
  /** Monto acumulado del pozo, en guaraníes. */
  poolAmount: number;
  balance: number;
  costPerPlay: number;
  /** "live" = sigue en juego · "reset" = alguien lo ganó y arranca de cero. */
  state?: "live" | "reset";
  onPlay: () => void;
  onTopUp?: () => void;
  loading?: boolean;
}

export function PozoHero({ poolAmount, balance, costPerPlay, state = "live", onPlay, onTopUp, loading }: PozoHeroProps) {
  const canPlay = balance >= costPerPlay;
  const plays = Math.floor(balance / costPerPlay);
  const missing = costPerPlay - balance;
  const reset = state === "reset";

  return (
    <section style={{
      position: "relative", borderRadius: 20, padding: "18px 16px 16px",
      border: `1px solid ${mix(rt.primary, 40)}`,
      background: `radial-gradient(120% 90% at 50% -10%, oklch(0.72 0.15 85/.16), transparent 62%), linear-gradient(to bottom, ${rt.card}, color-mix(in oklch, ${rt.card} 55%, ${rt.bg}))`,
      boxShadow: "0 10px 40px oklch(0.72 0.15 85/.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 12, fontWeight: 600, color: rt.primary }}>
        <span data-bg-anim style={{ width: 6, height: 6, borderRadius: "50%", background: rt.ok, animation: "bg-ping 2s ease-out infinite" }} />
        {reset ? "El pozo arranca de nuevo" : "El pozo global sigue en juego"}
      </div>

      <div style={{ marginTop: 12, textAlign: "center", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: rt.muted }}>
        Pozo acumulado
      </div>
      <div style={{
        marginTop: 2, textAlign: "center", fontFamily: rt.display, fontWeight: 900, fontSize: 40, lineHeight: 1.05, letterSpacing: "-.02em",
        background: `linear-gradient(135deg, ${rt.primary}, ${rt.primaryHi}, ${rt.primary})`,
        WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
        filter: "drop-shadow(0 0 22px oklch(0.72 0.15 85/.28))",
      }}>{fmtGs(poolAmount)}</div>
      <div style={{ marginTop: 5, textAlign: "center", fontSize: 11, color: rt.muted }}>
        {reset ? "Sé el primero en cargarlo con tu jugada" : "Sube con cada jugada de todos los locales"}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Stat k="Tu saldo" v={fmtGs(balance)} tone={canPlay ? "ok" : "bad"} />
        <Stat k="Por jugada" v={fmtGs(costPerPlay)} />
      </div>

      <button type="button" onClick={canPlay ? onPlay : (onTopUp ?? onPlay)} disabled={loading} style={{
        marginTop: 14, width: "100%", minHeight: 52, border: 0, borderRadius: 14,
        background: "linear-gradient(135deg, oklch(0.76 0.16 88), oklch(0.68 0.15 82))",
        color: rt.primaryFg, font: `800 16px/1 ${rt.display}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        cursor: loading ? "progress" : "pointer", opacity: loading ? 0.7 : 1,
        boxShadow: "0 6px 22px oklch(0.72 0.15 85/.3)",
      }}>
        {canPlay ? <IcBolt size={17} /> : <IcCard size={17} />}
        {canPlay ? "Jugar por el pozo" : "Cargar saldo y jugar"}
      </button>

      <div style={{ marginTop: 9, textAlign: "center", fontSize: 11, color: rt.muted }}>
        {canPlay ? `Te alcanza para ${plays} ${plays === 1 ? "jugada" : "jugadas"}` : `Te faltan ${fmtGs(missing)} para una jugada`}
      </div>
    </section>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "ok" | "bad" }) {
  return (
    <div style={{
      borderRadius: 12, padding: "9px 8px", textAlign: "center",
      background: `color-mix(in oklch, ${rt.mutedBg} 65%, transparent)`, border: `1px solid ${mix(rt.border, 40)}`,
    }}>
      <div style={{ fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: rt.muted }}>{k}</div>
      <div style={{
        marginTop: 3, fontFamily: rt.display, fontWeight: 700, fontSize: 15, lineHeight: 1.2, fontVariantNumeric: "tabular-nums",
        color: tone === "ok" ? rt.ok : tone === "bad" ? rt.destructive : rt.fg,
      }}>{v}</div>
    </div>
  );
}

/* ------------------------------------------------------------ SEPARADOR */
export function SectionSep({ label }: { label: string }) {
  const line: CSSProperties = { content: '""', flex: 1, height: 1, background: mix(rt.border, 55) };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 4 }}>
      <span style={line} />
      <span style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: rt.muted }}>{label}</span>
      <span style={line} />
    </div>
  );
}

/* ----------------------------------------------------------- PRIZE CARD */
export interface PrizeCardProps {
  name: string;
  imageUrl?: string | null;
  venueName: string;
  /** Ej. "Tenés 7 días para reclamarlo" */
  expiryLabel?: string;
  /** Rojo en vez de dorado cuando queda poco tiempo. */
  urgent?: boolean;
  code: string;
  /** Tu <QRCodeDisplay/> real. Si no lo pasás, se muestra un recuadro vacío. */
  qr?: ReactNode;
  onCopyCode?: () => void;
}

export function PrizeCard({ name, imageUrl, venueName, expiryLabel, urgent, code, qr, onCopyCode }: PrizeCardProps) {
  const urgColor = urgent ? rt.destructive : rt.primary;
  return (
    <section style={{
      borderRadius: 18, overflow: "hidden", border: `1px solid ${mix(rt.border, 60)}`,
      background: `color-mix(in oklch, ${rt.card} 70%, transparent)`,
    }}>
      <div style={{ display: "flex", gap: 13, padding: "15px 15px 13px", alignItems: "center" }}>
        <PrizeImage src={imageUrl} alt={name} size={64} radius={13} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: rt.display, fontWeight: 800, fontSize: 17, lineHeight: 1.15, color: rt.primary }}>{name}</div>
          <div style={{ marginTop: 4, fontSize: 11.5, lineHeight: 1.45, color: rt.muted }}>{venueName} · Se retira en el local</div>
        </div>
      </div>

      {expiryLabel && (
        <div style={{
          display: "flex", alignItems: "center", gap: 7, margin: "0 15px 13px", padding: "8px 10px", borderRadius: 10,
          fontSize: 12, fontWeight: 600, background: mix(urgColor, 10), color: urgColor,
        }}><IcClock size={14} />{expiryLabel}</div>
      )}

      <div style={{ padding: "0 15px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: rt.muted }}>Escaneá para reclamar</div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 11, display: "grid", placeItems: "center", minWidth: 150, minHeight: 150 }}>
          {qr ?? <span style={{ fontSize: 10, color: "#999" }}>QR</span>}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 10, margin: "13px 15px", padding: "10px 12px", minHeight: 48,
        borderRadius: 12, border: `1px solid ${mix(rt.border, 45)}`, background: `color-mix(in oklch, ${rt.mutedBg} 55%, transparent)`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9.5, letterSpacing: ".15em", textTransform: "uppercase", color: rt.muted }}>Código de reclamo</div>
          <div style={{ marginTop: 2, font: "600 15px/1.2 ui-monospace, SFMono-Regular, monospace", letterSpacing: ".12em", color: rt.primary }}>{code}</div>
        </div>
        <button type="button" aria-label="Copiar código" onClick={onCopyCode} style={{
          marginLeft: "auto", width: 44, height: 44, flex: "none", border: 0, background: "transparent",
          color: rt.muted, display: "grid", placeItems: "center", borderRadius: 10, cursor: "pointer",
        }}><IcCopy /></button>
      </div>

      <div style={{ padding: "0 15px 14px", textAlign: "center", fontSize: 11, lineHeight: 1.5, color: mix(rt.muted, 85) }}>
        Presentá este código en el local para retirar tu premio
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- BOTONES */
export function GhostButton({ icon, children, onClick }: { icon?: ReactNode; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%", minHeight: 48, borderRadius: 13, border: `1px solid ${mix(rt.primary, 38)}`,
      background: "transparent", color: rt.primary, font: `600 14px/1 ${rt.body}`,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 9, cursor: "pointer",
    }}>{icon}{children}</button>
  );
}

export function PlainButton({ icon, children, onClick }: { icon?: ReactNode; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%", minHeight: 44, border: 0, background: "transparent", color: rt.muted,
      font: `500 13.5px/1 ${rt.body}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
    }}>{icon}{children}</button>
  );
}

/* ------------------------------------------------ SIN PREMIO (encabezado) */
export function NoPrizeHead({ title, sub, note }: { title: string; sub?: string; note?: ReactNode }) {
  return (
    <>
      <div>
        <h1 style={{ margin: "2px 0 0", textAlign: "center", fontFamily: rt.display, fontWeight: 800, fontSize: 24, lineHeight: 1.15 }}>{title}</h1>
        {sub && <p style={{ margin: "5px 0 0", textAlign: "center", fontSize: 13, color: rt.muted }}>{sub}</p>}
      </div>
      {note && (
        <div style={{
          alignSelf: "center", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999,
          background: `color-mix(in oklch, ${rt.mutedBg} 60%, transparent)`, border: `1px solid ${mix(rt.border, 45)}`,
          fontSize: 11.5, color: rt.muted,
        }}><IcClock size={14} />{note}</div>
      )}
    </>
  );
}
