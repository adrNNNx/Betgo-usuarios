// components/staff/StaffPanel.tsx
"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/game-logic";
import {
  validateRechargeCode,
  loadPlayerBalance,
  type StaffProfile,
  type ValidatedPlayer,
} from "@/services/staff.service";
import { QRScanner } from "@/components/staff/QRScanner";
import {
  MapPin,
  UserRound,
  LogOut,
  Wallet,
  QrCode,
  Search,
  Camera,
  CircleCheckBig,
  Loader2,
  Banknote,
  CreditCard,
  Smartphone,
  StickyNote,
  RotateCcw,
  Check,
  Zap,
  Gift,
  AlertCircle,
} from "lucide-react";

// ==================== TYPES ====================

type ActiveTab = "cargar" | "premios";
type PaymentMethod = "cash" | "card" | "transfer";

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000];
const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "card", label: "Tarjeta", icon: CreditCard },
  { value: "transfer", label: "Transferencia", icon: Smartphone },
];

interface StaffPanelProps {
  profile: StaffProfile;
  onLogout: () => void;
}

// ==================== COMPONENT ====================

export function StaffPanel({ profile, onLogout }: StaffPanelProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("cargar");

  // Validate player state
  const [playerCode, setPlayerCode] = useState("");
  const [validatedPlayer, setValidatedPlayer] = useState<ValidatedPlayer | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Recharge form state
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [rechargeSuccess, setRechargeSuccess] = useState<{
    amount: number;
    newBalance: number;
    playerName: string | null;
  } | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Staff display name
  const staffName = profile.user.name
    ? profile.user.name.split(" ")[0] +
      (profile.user.name.split(" ")[1]
        ? " " + profile.user.name.split(" ")[1][0] + "."
        : "")
    : "Staff";

  const isPlayerValidated = !!validatedPlayer;
  const currentStep = isPlayerValidated ? 2 : 1;

  // ==================== VALIDATE PLAYER ====================

  const handleValidate = async () => {
    const code = playerCode.trim();
    if (!code) return;

    setIsValidating(true);
    setValidationError(null);
    setValidatedPlayer(null);
    setRechargeSuccess(null);

    try {
      const result = await validateRechargeCode(code);
      setValidatedPlayer(result);
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

  // Cuando el scanner lee un QR → setear código, cerrar scanner, auto-validar
  const handleScanResult = async (scannedCode: string) => {
    setPlayerCode(scannedCode);
    setShowScanner(false);
    setValidationError(null);
    setValidatedPlayer(null);
    setRechargeSuccess(null);

    // Auto-validar
    setIsValidating(true);
    try {
      const result = await validateRechargeCode(scannedCode);
      setValidatedPlayer(result);
    } catch (err: any) {
      setValidationError(
        err.response?.data?.message || "Error al validar el código"
      );
    } finally {
      setIsValidating(false);
    }
  };

  // ==================== RECHARGE ====================

  const handleRecharge = async () => {
    if (!validatedPlayer || amount <= 0) return;

    setIsRecharging(true);
    setRechargeError(null);

    try {
      const result = await loadPlayerBalance({
        code: validatedPlayer.code,
        amount,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      setRechargeSuccess({
        amount: result.amountLoaded,
        newBalance: result.user.newBalance,
        playerName: result.user.name,
      });
    } catch (err: any) {
      setRechargeError(
        err.response?.data?.message || "Error al cargar saldo"
      );
    } finally {
      setIsRecharging(false);
    }
  };

  // ==================== RESET ====================

  const handleClearForm = () => {
    setAmount(0);
    setPaymentMethod("cash");
    setNotes("");
    setRechargeError(null);
  };

  const handleNewRecharge = () => {
    setPlayerCode("");
    setValidatedPlayer(null);
    setValidationError(null);
    setRechargeSuccess(null);
    handleClearForm();
    codeInputRef.current?.focus();
  };

  // ==================== AMOUNT INPUT ====================

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw ? parseInt(raw) : 0);
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Bar Actual
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {profile.bar?.name || "Sin bar asignado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">{staffName}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ===== TABS ===== */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 border border-border/40 p-1">
          <button
            onClick={() => setActiveTab("cargar")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
              activeTab === "cargar"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Wallet className="h-4 w-4" />
            Cargar Saldo
          </button>
          <button
            onClick={() => setActiveTab("premios")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
              activeTab === "premios"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Gift className="h-4 w-4" />
            Validar Premios
          </button>
        </div>

        {/* ===== TAB: CARGAR SALDO ===== */}
        {activeTab === "cargar" && (
          <div className="space-y-4">

            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                currentStep >= 1
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/40 text-muted-foreground border border-border/40",
              )}>
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span>
                Validar
              </div>
              <div className="w-8 h-px bg-border/60" />
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                currentStep >= 2
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/40 text-muted-foreground border border-border/40",
              )}>
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}>2</span>
                Recargar
              </div>
            </div>

            {/* ===== VALIDATE PLAYER CARD ===== */}
            <section className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Validar Jugador</p>
                  <p className="text-xs text-muted-foreground">Pídele al cliente que muestre su QR</p>
                </div>
              </div>

              {/* Code input + buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* Input: en móvil tiene la cámara dentro, en sm+ es normal */}
                <div className="relative flex-1">
                  <input
                    ref={codeInputRef}
                    type="text"
                    value={playerCode}
                    onChange={(e) => {
                      setPlayerCode(e.target.value.toUpperCase());
                      setValidationError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingresa el código del jugador"
                    className="w-full rounded-lg bg-muted/40 border border-border/40 px-3 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:pr-3"
                    disabled={isValidating}
                  />
                  {/* Cámara dentro del input — solo móvil */}
                  <button
                    onClick={() => setShowScanner(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors sm:hidden"
                    aria-label="Escanear QR"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Cámara como botón independiente — solo sm+ */}
                <button
                  onClick={() => setShowScanner(true)}
                  className="hidden sm:flex items-center justify-center shrink-0 rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Escanear QR"
                >
                  <Camera className="h-4 w-4" />
                </button>

                {/* Validar: ancho completo en móvil, auto en sm+ */}
                <button
                  onClick={handleValidate}
                  disabled={!playerCode.trim() || isValidating}
                  className={cn(
                    "w-full sm:w-auto sm:shrink-0 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    playerCode.trim() && !isValidating
                      ? "bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25"
                      : "bg-muted/30 border border-border/30 text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Validar
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
            </section>

            {/* ===== PLAYER INFO CARD ===== */}
            <section className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 sm:p-8">
              {rechargeSuccess ? (
                /* === SUCCESS STATE === */
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CircleCheckBig className="h-8 w-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-foreground">
                      Recarga Exitosa
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saldo acreditado correctamente
                    </p>
                  </div>
                  <p className="text-xl font-bold text-emerald-400 font-display tabular-nums">
                    +{formatCurrency(rechargeSuccess.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nuevo saldo del jugador:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(rechargeSuccess.newBalance)}
                    </span>
                  </p>
                  <button
                    onClick={handleNewRecharge}
                    className="mt-2 flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nueva Recarga
                  </button>
                </div>
              ) : validatedPlayer ? (
                /* === VALIDATED PLAYER === */
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                    <UserRound className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground text-base">
                      {validatedPlayer.user.name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {validatedPlayer.user.phone}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/40 px-4 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Saldo actual</p>
                    <p className="text-lg font-bold text-primary tabular-nums font-display">
                      {formatCurrency(validatedPlayer.user.balance)}
                    </p>
                  </div>
                </div>
              ) : (
                /* === WAITING STATE === */
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center">
                    <UserRound className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Esperando jugador</p>
                  <p className="text-xs text-muted-foreground text-center">
                    Escanea el código QR del cliente para ver su información
                  </p>
                </div>
              )}
            </section>

            {/* ===== RECHARGE FORM ===== */}
            <section className={cn(
              "rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 space-y-5 transition-opacity",
              (!isPlayerValidated || !!rechargeSuccess) && "opacity-50 pointer-events-none",
            )}>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Recarga de Saldo</p>
                  <p className="text-xs text-muted-foreground">
                    {isPlayerValidated
                      ? "Completa los datos y registra el método de pago"
                      : "Valida un jugador primero para cargar saldo"}
                  </p>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Monto a cargar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    Gs.
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount > 0 ? amount.toLocaleString("es-PY") : ""}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full rounded-lg bg-muted/40 border border-border/40 pl-10 pr-4 py-3 text-base font-semibold text-foreground tabular-nums placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    disabled={!isPlayerValidated}
                  />
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                        amount === val
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border",
                      )}
                    >
                      <Zap className="h-3 w-3" />
                      {val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-medium transition-all",
                        paymentMethod === method.value
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground hover:border-border",
                      )}
                    >
                      <method.icon className="h-5 w-5" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ticket, referencia o comentario interno..."
                  rows={2}
                  className="w-full rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                />
              </div>

              {/* Recharge error */}
              {rechargeError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {rechargeError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClearForm}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar
                </button>
                <button
                  onClick={handleRecharge}
                  disabled={amount <= 0 || isRecharging || !!rechargeSuccess}
                  className={cn(
                    "flex-[1.5] flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]",
                    amount > 0 && !isRecharging
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isRecharging ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Confirmar
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ===== TAB: VALIDAR PREMIOS (placeholder) ===== */}
        {activeTab === "premios" && (
          <section className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 sm:p-12 flex flex-col items-center gap-3">
            <Gift className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Validar Premios</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Esta sección estará disponible próximamente. Acá podrás validar y entregar premios locales del bar.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
