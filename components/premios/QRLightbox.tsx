// components/premios/QRLightbox.tsx
"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { useCopyCode } from "./useCopyCode";

/** Lo mínimo que usamos del sentinel; la API no está en los tipos del DOM. */
type WakeLockSentinel = { release?: () => Promise<void> };

interface QRLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimCode: string;
  prizeName: string;
  barName?: string | null;
  /** Texto ya formateado: "5 h 20 min". */
  timeLeftLabel?: string;
}

/**
 * QR a pantalla casi completa sobre blanco sólido.
 *
 * Tres decisiones deliberadas:
 * - Fondo blanco puro y QR del ancho del viewport: un QR chico sobre fondo
 *   oscuro no escanea con el brillo bajo.
 * - Wake Lock mientras está abierto: la pantalla no se apaga ni se atenúa
 *   justo cuando el mozo está apuntando el escáner. (No existe API web para
 *   subir el brillo; esto es lo más cerca que se puede llegar.)
 * - El código alfanumérico se ve igual de grande: si el escáner falla, el mozo
 *   lo tipea sin que el usuario tenga que cerrar nada.
 */
export function QRLightbox({
  open,
  onOpenChange,
  claimCode,
  prizeName,
  barName,
  timeLeftLabel,
}: QRLightboxProps) {
  const { copied, copy } = useCopyCode();
  const [qrSize, setQrSize] = useState(280);

  // Tamaño del QR según el viewport real del celular
  useEffect(() => {
    if (!open) return;
    const measure = () =>
      setQrSize(
        Math.max(200, Math.min(window.innerWidth - 96, window.innerHeight - 340, 360)),
      );
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  // Mantener la pantalla encendida mientras se muestra el QR
  useEffect(() => {
    if (!open) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
        }).wakeLock;
        if (!wl) return;
        const s = await wl.request("screen");
        if (cancelled) {
          s.release?.();
          return;
        }
        sentinel = s;
      } catch {
        // Sin wake lock la pantalla se puede atenuar; no es bloqueante.
      }
    };
    request();

    return () => {
      cancelled = true;
      sentinel?.release?.().catch(() => {});
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="w-screen max-w-none h-[100svh] sm:h-auto sm:w-[calc(100vw-2rem)] sm:max-w-md rounded-none sm:rounded-2xl border-0 bg-white p-0 gap-0 flex flex-col items-center justify-center"
      >
        <DialogTitle className="sr-only">
          Código QR de {prizeName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Mostrale este código al mozo para que escanee y te entregue el premio
        </DialogDescription>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex w-full flex-col items-center gap-5 px-6 py-10">
          <div className="text-center">
            <p className="font-display text-lg font-extrabold text-neutral-900">
              {prizeName}
            </p>
            {barName && (
              <p className="mt-1 text-xs text-neutral-500">{barName}</p>
            )}
          </div>

          <QRCodeDisplay value={claimCode} size={qrSize} level="M" quietZone={0} />

          <div className="w-full text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Código de reclamo
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-semibold tracking-[0.16em] text-neutral-900">
                {claimCode}
              </span>
              <button
                onClick={() => copy(claimCode)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Copiar código"
              >
                {copied ? (
                  <Check className="h-4.5 w-4.5 text-emerald-600" />
                ) : (
                  <Copy className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-500">
            Mostrale esta pantalla al mozo
          </p>
        </div>

        {timeLeftLabel && (
          <p className="absolute bottom-5 left-6 right-6 text-center text-[11px] text-neutral-400">
            Vence en {timeLeftLabel}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
