// JackpotIcons.tsx — iconos de la pantalla de pozo global.
"use client";

import React from "react";

type P = { size?: number; color?: string; width?: number };
const S = ({ size = 17, color = "currentColor", width = 2, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", display: "block" }}>
    {children}
  </svg>
);

export const IcTrophy = (p: P) => <S {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" /><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" /></S>;
export const IcPhone = (p: P) => <S {...p}><path d="M21 15.5v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 011.1 2.8 2 2 0 013.1.6h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L7.1 8.4a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.8 2.1z" /></S>;
export const IcInfo = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" /></S>;
export const IcPin = (p: P) => <S {...p}><path d="M12 21s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10z" /><circle cx="12" cy="11" r="2.5" /></S>;
export { IcCheck, IcClock, IcCopy, IcArrowLeft, IcGift } from "./ResultadoIcons";
