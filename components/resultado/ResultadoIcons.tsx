// ResultadoIcons.tsx — iconos SVG stroke, sin dependencias.
"use client";

import React from "react";

type P = { size?: number; color?: string; width?: number };
const S = ({ size = 17, color = "currentColor", width = 2, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", display: "block" }}>
    {children}
  </svg>
);

export const IcBolt = (p: P) => <S {...p} width={p.width ?? 2.4}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></S>;
export const IcCheck = (p: P) => <S {...p}><path d="M20 6L9 17l-5-5" /></S>;
export const IcClock = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>;
export const IcCopy = (p: P) => <S {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></S>;
export const IcArrowLeft = (p: P) => <S {...p}><path d="M10 19l-7-7 7-7M3 12h18" /></S>;
export const IcArrowDown = (p: P) => <S {...p}><path d="M12 5v14M19 12l-7 7-7-7" /></S>;
export const IcCard = (p: P) => <S {...p}><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" /></S>;
export const IcGift = (p: P) => <S {...p}><path d="M12 8v8M8 12h8" /><circle cx="12" cy="12" r="9" /></S>;
