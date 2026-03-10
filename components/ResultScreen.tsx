// components/ResultScreen.tsx
"use client";

import { GameResult, User } from "@/types/game";
import { formatCurrency } from "@/lib/game-logic";
import { cn } from "@/lib/utils";

interface ResultScreenProps {
  result: GameResult;
  user: User;
  spinCost: number;
  onPlayGlobalPot?: () => void;
  onLoadBalance?: () => void;
  onBackToHome: () => void;
}

export function ResultScreen({
  result,
  user,
  spinCost,
  onPlayGlobalPot,
  onLoadBalance,
  onBackToHome,
}: ResultScreenProps) {
  const hasSufficientBalance = user.balance >= spinCost;
  const canPlayGlobalPot = user.isAuthenticated && hasSufficientBalance;

  return (
    <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        {/* Logo del bar (pequeño) */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-yellow-600/30">
            <div className="text-2xl font-display text-yellow-400">
              EL MARISCAL
            </div>
            <div className="text-xs text-gray-400">BARRA & CERVEZA</div>
          </div>
        </div>

        {/* Mensaje de resultado */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl text-white">
            Esta vez no fue
          </h1>
          <p className="text-gray-300 font-body text-lg">
            Pero puedes seguir intentando
          </p>
        </div>

        {/* Card de información */}
        <div
          className={cn(
            "bg-gradient-to-br from-gray-800/90 to-gray-900/90",
            "backdrop-blur-sm",
            "rounded-2xl p-6",
            "border-2 border-gray-700/50",
            "shadow-2xl",
            "space-y-4",
          )}
        >
          {/* Pozo Global */}
          <div className="text-center p-4 bg-black/30 rounded-xl border border-yellow-600/20">
            <p className="text-gray-400 text-sm font-body mb-1">
              Pozo Global Actual
            </p>
            <p className="text-yellow-400 font-display text-3xl sm:text-4xl gold-glow">
              {formatCurrency(result.newPotAmount)}
            </p>
          </div>

          {/* Información del usuario (solo si está autenticado) */}
          {user.isAuthenticated && (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-black/20 rounded-lg">
                <p className="text-gray-400 text-xs font-body mb-1">Saldo:</p>
                <p className="text-green-400 font-display text-xl">
                  {formatCurrency(result.newBalance)}
                </p>
              </div>
              <div className="text-center p-3 bg-black/20 rounded-lg">
                <p className="text-gray-400 text-xs font-body mb-1">Costo:</p>
                <p className="text-white font-display text-xl">
                  {formatCurrency(spinCost)}
                </p>
              </div>
            </div>
          )}

          {/* Mensaje de saldo suficiente */}
          {canPlayGlobalPot && (
            <div className="text-center p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
              <p className="text-green-400 font-body text-sm font-semibold">
                ¡Tienes saldo suficiente! Juega por el pozo global
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Botón: Jugar por el Pozo Global */}
          {canPlayGlobalPot && onPlayGlobalPot && (
            <button
              onClick={onPlayGlobalPot}
              className={cn(
                "w-full",
                "bg-gradient-to-r from-yellow-400 to-yellow-500",
                "hover:from-yellow-500 hover:to-yellow-600",
                "text-green-900 font-display text-xl sm:text-2xl font-black",
                "py-4 px-6",
                "rounded-full",
                "shadow-xl hover:shadow-yellow-400/50",
                "transition-all duration-300",
                "hover:scale-[1.02]",
                "pulse-glow",
              )}
            >
              Jugar por el Pozo Global
            </button>
          )}

          {/* Botón: Cargar más saldo */}
          {user.isAuthenticated && onLoadBalance && (
            <button
              onClick={onLoadBalance}
              className={cn(
                "w-full",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "text-white font-body text-lg font-semibold",
                "py-3 px-6",
                "rounded-full",
                "shadow-lg hover:shadow-blue-400/50",
                "transition-all duration-300",
                "hover:scale-[1.02]",
              )}
            >
              Cargar más saldo
            </button>
          )}

          {/* Botón: Volver al inicio */}
          <button
            onClick={onBackToHome}
            className={cn(
              "w-full",
              "bg-gray-700 hover:bg-gray-600",
              "text-white font-body text-base",
              "py-3 px-6",
              "rounded-full",
              "shadow-lg",
              "transition-all duration-300",
              "hover:scale-[1.02]",
            )}
          >
            Volver al inicio
          </button>
        </div>

        {/* Nota para usuarios no autenticados */}
        {!user.isAuthenticated && (
          <p className="text-center text-gray-400 text-sm font-body">
            Regístrate o inicia sesión para jugar por el pozo global y ganar
            premios mayores
          </p>
        )}
      </div>

      {/* Decoraciones de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-red-400/10 rounded-full blur-3xl shimmer" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
      </div>
    </div>
  );
}
