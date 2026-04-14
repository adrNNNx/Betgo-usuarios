// components/staff/ValidatePrizesTab.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import {
  validatePrizeClaim,
  deliverPrize,
  getPendingClaims,
  type ValidatedPrizeClaim,
  type PendingClaimItem,
} from "@/services/staff.service";
import { QRScanner } from "@/components/staff/QRScanner";
import {
  Gift,
  QrCode,
  Search,
  Camera,
  Loader2,
  AlertCircle,
  CircleCheckBig,
  UserRound,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  PackageCheck,
} from "lucide-react";

interface ValidatePrizesTabProps {
  barId: string | null;
}

export function ValidatePrizesTab({ barId }: ValidatePrizesTabProps) {
  // Validate state
  const [prizeCode, setPrizeCode] = useState("");
  const [validatedClaim, setValidatedClaim] = useState<ValidatedPrizeClaim | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Deliver state
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliverError, setDeliverError] = useState<string | null>(null);
  const [deliverSuccess, setDeliverSuccess] = useState<{
    prizeName: string;
    userName: string | null;
  } | null>(null);

  // Pending list state
  const [pendingClaims, setPendingClaims] = useState<PendingClaimItem[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // ==================== LOAD PENDING ====================

  const loadPending = useCallback(async () => {
    if (!barId) return;
    setIsLoadingPending(true);
    try {
      const data = await getPendingClaims();
      setPendingClaims(data);
    } catch {
      // Silencioso — la lista se muestra vacía
    } finally {
      setIsLoadingPending(false);
    }
  }, [barId]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // ==================== VALIDATE ====================

  const handleValidate = async (code?: string) => {
    const codeToValidate = (code || prizeCode).trim();
    if (!codeToValidate) return;

    setIsValidating(true);
    setValidationError(null);
    setValidatedClaim(null);
    setDeliverSuccess(null);
    setDeliverError(null);

    try {
      const result = await validatePrizeClaim(codeToValidate);
      setValidatedClaim(result);
      setPrizeCode(codeToValidate);
    } catch (err: any) {
      setValidationError(
        err.response?.data?.message || "Error al validar el código"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleValidate();
  };

  const handleScanResult = async (scannedCode: string) => {
    setShowScanner(false);
    setPrizeCode(scannedCode);
    await handleValidate(scannedCode);
  };

  // ==================== DELIVER ====================

  const handleDeliver = async () => {
    if (!validatedClaim) return;

    setIsDelivering(true);
    setDeliverError(null);

    try {
      const result = await deliverPrize(validatedClaim.claimCode);

      setDeliverSuccess({
        prizeName: result.prize.name,
        userName: result.user.name,
      });

      // Refrescar lista de pendientes
      loadPending();
    } catch (err: any) {
      setDeliverError(
        err.response?.data?.message || "Error al entregar el premio"
      );
    } finally {
      setIsDelivering(false);
    }
  };

  // ==================== RESET ====================

  const handleNewValidation = () => {
    setPrizeCode("");
    setValidatedClaim(null);
    setValidationError(null);
    setDeliverSuccess(null);
    setDeliverError(null);
    codeInputRef.current?.focus();
  };

  // ==================== COPY CODE ====================

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Silencioso
    }
  };

  // ==================== USE CODE FROM PENDING LIST ====================

  const handleUsePendingCode = (code: string) => {
    setPrizeCode(code);
    setValidatedClaim(null);
    setDeliverSuccess(null);
    handleValidate(code);
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-4">

      {/* ===== VALIDATE PRIZE CARD ===== */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Validar Premio</p>
            <p className="text-xs text-muted-foreground">
              Escanea o ingresa el código QR del premio ganado por el jugador
            </p>
          </div>
        </div>

        {/* Code input + buttons */}
        <div className="flex gap-2">
          <input
            ref={codeInputRef}
            type="text"
            value={prizeCode}
            onChange={(e) => {
              setPrizeCode(e.target.value.toUpperCase());
              setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Código del premio"
            className="flex-1 rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
            disabled={isValidating}
          />
          <button
            onClick={() => setShowScanner(true)}
            className="shrink-0 rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Escanear QR"
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleValidate()}
            disabled={!prizeCode.trim() || isValidating}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
              prizeCode.trim() && !isValidating
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted/30 border border-border/30 text-muted-foreground cursor-not-allowed",
            )}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Validar Código
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {validationError}
          </div>
        )}

        {/* QR Scanner */}
        {showScanner && (
          <QRScanner
            onResult={handleScanResult}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Jackpot note */}
        <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Nota importante:</p>
            <p className="text-xs text-muted-foreground">
              Si el jugador ganó el pozo global, debe contactar soporte. Solo puedes validar premios locales de este bar.
            </p>
          </div>
        </div>
      </section>

      {/* ===== VALIDATED PRIZE / SUCCESS / WAITING ===== */}
      <section className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-5 sm:p-6">
        {deliverSuccess ? (
          /* === SUCCESS === */
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CircleCheckBig className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">
                Premio Entregado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {deliverSuccess.prizeName}
              </p>
              {deliverSuccess.userName && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Entregado a {deliverSuccess.userName}
                </p>
              )}
            </div>
            <button
              onClick={handleNewValidation}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Validar otro premio
            </button>
          </div>
        ) : validatedClaim ? (
          /* === VALIDATED CLAIM === */
          <div className="space-y-4 animate-fade-in">
            {/* Prize info */}
            <div className="flex items-center gap-4">
              {validatedClaim.prize.imageUrl ? (
                <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-muted/40 border border-border/40">
                  <img
                    src={validatedClaim.prize.imageUrl}
                    alt={validatedClaim.prize.name}
                    className="w-full h-full object-contain p-1"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Gift className="h-7 w-7 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-base">
                  {validatedClaim.prize.name}
                </p>
                {validatedClaim.prize.value && (
                  <p className="text-sm font-bold text-primary tabular-nums font-display">
                    {formatCurrency(validatedClaim.prize.value)}
                  </p>
                )}
                {validatedClaim.prize.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {validatedClaim.prize.description}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/40" />

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center">
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {validatedClaim.user.name || "Sin nombre"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {validatedClaim.user.phone}
                </p>
              </div>
            </div>

            {/* Deliver error */}
            {deliverError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {deliverError}
              </div>
            )}

            {/* Deliver button */}
            <button
              onClick={handleDeliver}
              disabled={isDelivering}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]",
                !isDelivering
                  ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-500"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed",
              )}
            >
              {isDelivering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PackageCheck className="h-4 w-4" />
              )}
              Marcar como Entregado
            </button>
          </div>
        ) : (
          /* === WAITING === */
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center">
              <QrCode className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Esperando código</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Escanea el código QR del premio o ingresalo manualmente para verificar
            </p>
          </div>
        )}
      </section>

      {/* ===== PENDING CLAIMS LIST ===== */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Premios Pendientes</p>
            <p className="text-xs text-muted-foreground">
              Lista de códigos de premios pendientes de validar para este bar
            </p>
          </div>
          {pendingClaims.length > 0 && (
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
              {pendingClaims.length}
            </span>
          )}
        </div>

        {isLoadingPending ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : pendingClaims.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No hay premios pendientes de validar.
          </p>
        ) : (
          <div className="space-y-2">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-xl border border-border/40 bg-muted/20 p-3 flex items-center gap-3"
              >
                {/* Prize icon/image */}
                {claim.prize.imageUrl ? (
                  <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted/40 border border-border/30">
                    <img
                      src={claim.prize.imageUrl}
                      alt={claim.prize.name}
                      className="w-full h-full object-contain p-0.5"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {claim.prize.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {claim.user.name || claim.user.phone} •{" "}
                    <span className="font-mono">{claim.claimCode}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyCode(claim.claimCode)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label="Copiar código"
                  >
                    {copiedCode === claim.claimCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleUsePendingCode(claim.claimCode)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Validar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
