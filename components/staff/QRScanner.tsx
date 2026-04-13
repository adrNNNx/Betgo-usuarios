// components/staff/QRScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Camera, X, AlertCircle } from "lucide-react";

interface QRScannerProps {
  /** Callback cuando se escanea un QR exitosamente */
  onResult: (data: string) => void;
  /** Cerrar el scanner */
  onClose: () => void;
}

/**
 * Scanner QR que usa la cámara del dispositivo.
 *
 * Requiere: npm install html5-qrcode
 *
 * - Prefiere cámara trasera en móvil
 * - Auto-stop al leer un código
 * - Parsea el qrData JSON del backend para extraer el código
 * - Cleanup automático al desmontar
 */
export function QRScanner({ onResult, onClose }: QRScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const hasResultRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        // Dynamic import para evitar problemas de SSR en Next.js
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted || !containerRef.current) return;

        const scannerId = "betgo-qr-scanner";

        // Crear el elemento contenedor si no existe
        if (!document.getElementById(scannerId)) {
          const div = document.createElement("div");
          div.id = scannerId;
          containerRef.current.appendChild(div);
        }

        const scanner = new Html5Qrcode(scannerId);

        await scanner.start(
          { facingMode: "environment" }, // Cámara trasera
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          // onScanSuccess
          (decodedText: string) => {
            if (hasResultRef.current) return;
            hasResultRef.current = true;

            // Extraer código del qrData JSON del backend
            const code = parseQRData(decodedText);

            // Parar scanner antes de notificar
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                onResult(code);
              });
          },
          // onScanFailure - ignorar, es normal cuando no hay QR en vista
          () => {},
        );

        // Solo asignar el ref si start() resolvió correctamente
        scannerRef.current = scanner;
        if (mounted) setIsStarting(false);
      } catch (err: any) {
        if (!mounted) return;
        setIsStarting(false);
        console.error("Error iniciando cámara:", err);
        if (
          err?.message?.includes("Permission") ||
          err?.name === "NotAllowedError"
        ) {
          setError("Permiso de cámara denegado. Habilitalo en la configuración del navegador.");
        } else if (
          err?.message?.includes("NotFound") ||
          err?.name === "NotFoundError"
        ) {
          setError("No se encontró una cámara disponible en este dispositivo.");
        } else {
          setError("No se pudo iniciar la cámara. Intenta con el código manual.");
        }
      }
    };

    startScanner();

    // Cleanup
    return () => {
      mounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        try {
          scanner
            .stop()
            .catch(() => {})
            .finally(() => {
              try { scanner.clear?.(); } catch {}
            });
        } catch {
          try { scanner.clear?.(); } catch {}
        }
      }
    };
  }, [onResult]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-background">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Scanner container */}
      <div
        ref={containerRef}
        className={cn(
          "w-full aspect-square max-h-[300px] overflow-hidden",
          "[&_video]:object-cover [&_video]:w-full [&_video]:h-full",
          "[&_#betgo-qr-scanner]:w-full [&_#betgo-qr-scanner]:h-full",
          "[&_#betgo-qr-scanner__scan_region]:!border-primary/60",
          "[&_#betgo-qr-scanner__dashboard]:!hidden",
        )}
      />

      {/* Loading state */}
      {isStarting && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90">
          <Camera className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Iniciando cámara...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/95 px-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-xs text-muted-foreground text-center">{error}</p>
          <button
            onClick={onClose}
            className="text-xs text-primary hover:underline"
          >
            Usar código manual
          </button>
        </div>
      )}

      {/* Scanning indicator */}
      {!isStarting && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent px-3 py-2">
          <p className="text-[11px] text-muted-foreground text-center">
            Apunta al código QR del cliente
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Parsea el qrData del backend.
 *
 * El backend genera: { "code": "ABCD1234", "userId": "uuid", "type": "recharge" }
 * Si es JSON válido con campo "code", extrae ese campo.
 * Si no, retorna el texto tal cual (podría ser el código directo).
 */
function parseQRData(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.code && typeof parsed.code === "string") {
      return parsed.code;
    }
  } catch {
    // No es JSON — usar el texto directo
  }
  return raw.trim();
}
