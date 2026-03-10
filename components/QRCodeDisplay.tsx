// components/QRCodeDisplay.tsx
/**
 * Componente para generar y mostrar códigos QR reales
 *
 * Instalación requerida:
 * npm install qrcode.react
 *
 * Uso:
 * import { QRCodeDisplay } from '@/components/QRCodeDisplay';
 *
 * <QRCodeDisplay
 *   value="user-id-12345-timestamp-1234567890"
 *   size={256}
 * />
 */

"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  className?: string;
}

export function QRCodeDisplay({
  value,
  size = 256,
  level = "M",
  className,
}: QRCodeDisplayProps) {
  return (
    <div className={cn("inline-block", className)}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={true}
        bgColor="#ffffff"
        fgColor="#000000"
      />

      {/* Placeholder mientras no está instalada la librería */}
      {/* <div
        className="bg-white rounded-lg flex items-center justify-center border-4 border-gray-200"
        style={{ width: size, height: size }}
      >
        <div className="text-center p-4">
          <div className="text-6xl mb-2">📱</div>
          <p className="text-xs text-gray-600 font-mono break-all">{value}</p>
          <p className="text-xs text-gray-400 mt-2">QR Code Placeholder</p>
        </div>
      </div> */}
    </div>
  );
}

/**
 * Hook para generar códigos QR con expiración
 */
export function useQRCode(expirationMinutes: number = 2) {
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const generate = useCallback(
    async (userId: string) => {
      // En producción, llamar al backend para generar código seguro
      // const response = await fetch('/api/user/generate-qr', { ... });

      // Simulación local
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const newCode = `${userId}-${timestamp}-${randomStr}`;

      const expiration = new Date();
      expiration.setMinutes(expiration.getMinutes() + expirationMinutes);

      setCode(newCode);
      setExpiresAt(expiration);
      setIsExpired(false);
    },
    [expirationMinutes],
  );

  useEffect(() => {
    if (!expiresAt) return;

    const checkExpiration = setInterval(() => {
      if (new Date() >= expiresAt) {
        setIsExpired(true);
        clearInterval(checkExpiration);
      }
    }, 1000);

    return () => clearInterval(checkExpiration);
  }, [expiresAt]);

  const timeRemaining = useMemo(() => {
    if (!expiresAt || isExpired) return 0;
    return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  }, [expiresAt, isExpired]);

  return {
    code,
    isExpired,
    timeRemaining,
    generate,
  };
}

// Importaciones faltantes
import { useState, useEffect, useCallback, useMemo } from "react";
