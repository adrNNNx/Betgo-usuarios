// components/LoadBalanceModal.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import {
  generateRechargeCode,
  getRechargeCodeStatus,
} from "@/services/recharge.service";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  X,
  Smartphone,
  ScanLine,
  CircleCheckBig,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Wallet,
  Clock,
  AlertCircle,
} from "lucide-react";

// ==================== TIPOS ====================

type ModalState = "loading" | "qr" | "processing" | "success" | "error";

interface LoadBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBalance: number;
  onSuccess?: (amount: number) => void;
}

/** Intervalo de polling en ms */
const POLL_INTERVAL = 3000;

// ==================== COMPONENT ====================

export function LoadBalanceModal({
  open,
  onOpenChange,
  userBalance,
  onSuccess,
}: LoadBalanceModalProps) {
  const [state, setState] = useState<ModalState>("loading");
  const [code, setCode] = useState("");
  const [qrData, setQrData] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loadedAmount, setLoadedAmount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const codeRef = useRef("");
  // Captura el balance al abrir el modal para evitar doble-conteo en success
  const initialBalanceRef = useRef(0);
  // Preserva el último QR/código para mostrar como overlay durante regeneración
  const prevQrDataRef = useRef("");
  const prevCodeRef = useRef("");

  // ==================== GENERAR CÓDIGO (API) ====================
  const requestNewCode = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    setCopied(false);

    try {
      const data = await generateRechargeCode();

      prevQrDataRef.current = data.qrData;
      prevCodeRef.current = data.code;
      setCode(data.code);
      setQrData(data.qrData);
      setSecondsLeft(data.expiresInSeconds);
      codeRef.current = data.code;
      setState("qr");
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Error al generar el código";
      setErrorMsg(msg);
      setState("error");
    }
  }, []);

  // ==================== AL ABRIR / CERRAR ====================
  useEffect(() => {
    if (open) {
      // Capturar balance antes de cualquier recarga para evitar doble-conteo
      initialBalanceRef.current = userBalance;
      requestNewCode();
    } else {
      // Limpiar todo al cerrar
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
      setState("loading");
      setCode("");
      setQrData("");
      setLoadedAmount(0);
      setCopied(false);
      setErrorMsg("");
      codeRef.current = "";
      prevQrDataRef.current = "";
      prevCodeRef.current = "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requestNewCode]);

  // ==================== COUNTDOWN ====================
  useEffect(() => {
    if (!open || state !== "qr") {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [open, state]);

  // ==================== POLLING DE ESTADO ====================
  useEffect(() => {
    if (!open || state !== "qr" || !codeRef.current) {
      clearInterval(pollRef.current);
      return;
    }

    const poll = async () => {
      try {
        const status = await getRechargeCodeStatus(codeRef.current);

        if (status.status === "used" && status.amountLoaded) {
          // ¡El mozo cargó el saldo!
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);

          setState("processing");

          // Breve delay para mostrar la animación de procesando
          setTimeout(() => {
            setLoadedAmount(status.amountLoaded!);
            setState("success");
            onSuccess?.(status.amountLoaded!);
          }, 1500);
        } else if (status.status === "expired" || status.isExpired) {
          // El servidor confirmó expiración
          clearInterval(pollRef.current);
          setSecondsLeft(0);
        } else {
          // Sincronizar timer con servidor
          if (status.expiresInSeconds > 0) {
            setSecondsLeft(status.expiresInSeconds);
          }
        }
      } catch {
        // Error silencioso en polling — se reintenta en el próximo ciclo
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [open, state, onSuccess]);

  const isExpired = secondsLeft <= 0 && state === "qr";
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // ==================== COPIAR CÓDIGO ====================
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  // ==================== REGENERAR ====================
  const handleRegenerate = () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    requestNewCode();
  };

  // ==================== CERRAR ====================
  const handleClose = () => {
    onOpenChange(false);
  };

  // En success usa el balance capturado al abrir (evita doble-conteo cuando
  // onSuccess ya actualizó el prop userBalance antes del re-render)
  const displayBalance =
    state === "success" ? initialBalanceRef.current + loadedAmount : userBalance;

  // ==================== STEPS ====================
  const currentStep = state === "qr" || state === "loading" ? 0 : state === "processing" ? 1 : 2;
  const steps = [
    { icon: Smartphone, label: "Muestra este codigo" },
    { icon: ScanLine, label: "El mozo lo escanea" },
    { icon: CircleCheckBig, label: "Saldo acreditado" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border-border/60 bg-card p-0 gap-0 overflow-y-auto max-h-[90svh]"
        style={{ boxShadow: "0 25px 60px oklch(0 0 0 / 0.5)" }}
      >
        <DialogTitle className="sr-only">Cargar Saldo</DialogTitle>
        <DialogDescription className="sr-only">
          Genera un código QR para que el mozo pueda cargar saldo a tu cuenta
        </DialogDescription>

        {/* ===== HEADER ===== */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 sm:px-6 sm:pt-6 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                Cargar Saldo
              </h2>
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 border border-border/40 px-2.5 py-1">
                <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-semibold text-primary tabular-nums">
                  {formatCurrency(displayBalance)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Muestra el codigo al mozo para cargar saldo
            </p>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        {/* ===== BODY ===== */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">

          {/* ===== STATE: LOADING ===== */}
          {state === "loading" && (
            <div className="flex flex-col items-center gap-4 sm:gap-5 animate-fade-in">
              {/* QR con spinner superpuesto */}
              <div className="relative">
                <div className="rounded-xl bg-white p-3 sm:p-4 shadow-sm opacity-30">
                  <QRCodeSVG
                    value={prevQrDataRef.current || "BETGO"}
                    size={160}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-border/40">
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Generando código...
              </p>
            </div>
          )}

          {/* ===== STATE: ERROR ===== */}
          {state === "error" && (
            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-foreground">
                  Error
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMsg}
                </p>
              </div>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
            </div>
          )}

          {/* ===== STATE: QR ===== */}
          {state === "qr" && (
            <div className="flex flex-col items-center gap-4 sm:gap-5 animate-fade-in">
              {/* Steps */}
              <div className="flex items-center justify-center gap-6 sm:gap-8 w-full">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                        i === currentStep
                          ? "bg-primary/15 border border-primary/40 text-primary"
                          : i < currentStep
                            ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-400"
                            : "bg-muted/40 border border-border/40 text-muted-foreground",
                      )}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[80px]">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              <div
                className={cn(
                  "rounded-xl bg-white p-3 sm:p-4 shadow-sm transition-opacity",
                  isExpired && "opacity-30",
                )}
              >
                <QRCodeSVG
                  value={qrData || "placeholder"}
                  size={160}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* Alphanumeric code + copy */}
              <div className="flex items-center gap-2 w-full max-w-[280px]">
                <div className="flex-1 rounded-lg bg-muted/40 border border-border/40 px-3 py-2">
                  <p className="font-mono text-sm text-foreground text-center truncate">
                    {code}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg bg-muted/40 border border-border/40 p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Copiar código"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock
                  className={cn(
                    "h-4 w-4",
                    isExpired ? "text-destructive" : "text-primary",
                  )}
                />
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums font-display",
                    isExpired ? "text-destructive" : "text-primary",
                  )}
                >
                  {isExpired ? "0:00" : timeDisplay}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isExpired ? "expirado" : "restantes"}
                </span>
              </div>
            </div>
          )}

          {/* ===== STATE: PROCESSING ===== */}
          {state === "processing" && (
            <div className="flex flex-col items-center gap-5 py-8 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-foreground">
                  Procesando...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  El mozo esta verificando tu codigo
                </p>
              </div>
            </div>
          )}

          {/* ===== STATE: SUCCESS ===== */}
          {state === "success" && (
            <div className="flex flex-col items-center gap-5 py-6 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CircleCheckBig className="h-9 w-9 text-emerald-400" />
                </div>
                <div
                  className="absolute inset-[-8px] rounded-full border border-emerald-400/20"
                  style={{ animation: "pulse-ring 2s ease-out infinite" }}
                />
              </div>

              <div className="text-center">
                <p className="font-display text-xl font-bold text-foreground">
                  Carga Exitosa
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tu saldo ha sido actualizado
                </p>
              </div>

              <p className="text-2xl font-bold text-emerald-400 font-display tabular-nums">
                +{formatCurrency(loadedAmount)}
              </p>

              <button
                onClick={handleClose}
                className="w-full max-w-[260px] rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.15 85), oklch(0.68 0.17 70))",
                  color: "oklch(0.2 0.05 160)",
                  boxShadow: "0 4px 16px oklch(0.72 0.15 85 / 0.25)",
                }}
              >
                Continuar
              </button>
            </div>
          )}
        </div>

        {/* ===== FOOTER (only in QR state) ===== */}
        {state === "qr" && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <button
              onClick={handleRegenerate}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Generar nuevo codigo
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
