// components/QRCodeDisplay.tsx
"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  /** Contenido a codificar. Para premios: el `claimCode` ("P-XXXXXXXX"). */
  value: string;
  /** Lado del QR en px. */
  size?: number;
  /** Corrección de error. "M" alcanza para un código corto. */
  level?: "L" | "M" | "Q" | "H";
  /** Padding blanco alrededor del QR. Sin esto muchos escáneres fallan. */
  quietZone?: number;
  className?: string;
}

/**
 * QR sobre fondo blanco sólido, generado en el cliente.
 * El fondo blanco no es decorativo: es lo que hace que el escáner del mozo
 * enganche en un bar con poca luz.
 */
export function QRCodeDisplay({
  value,
  size = 132,
  level = "M",
  quietZone = 12,
  className,
}: QRCodeDisplayProps) {
  return (
    <div
      className={cn("inline-block rounded-xl bg-white", className)}
      style={{ padding: quietZone }}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  );
}
