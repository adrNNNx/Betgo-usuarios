// components/AuthRequired.tsx
"use client";

import { cn } from "@/lib/utils";

interface AuthRequiredProps {
  onBack: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

export function AuthRequired({
  onBack,
  onLogin,
  onRegister,
}: AuthRequiredProps) {
  return (
    <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        {/* Icono */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400/50 mb-4">
            <span className="text-5xl">🔒</span>
          </div>
        </div>

        {/* Mensaje */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-2xl sm:text-3xl text-white">
            Autenticación Requerida
          </h1>
          <p className="text-gray-300 font-body text-lg">
            Debes estar autenticado para jugar por el pozo global
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
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-gray-300 font-body text-sm flex-1">
                Carga saldo y juega por premios mayores
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <p className="text-gray-300 font-body text-sm flex-1">
                Accede al pozo global acumulado
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <p className="text-gray-300 font-body text-sm flex-1">
                Lleva el control de tus jugadas y premios
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          {/* Botón de registro */}
          {onRegister && (
            <button
              onClick={onRegister}
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
              Crear Cuenta
            </button>
          )}

          {/* Botón de login */}
          {onLogin && (
            <button
              onClick={onLogin}
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
              Iniciar Sesión
            </button>
          )}

          {/* Botón de volver */}
          <button
            onClick={onBack}
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
            Volver
          </button>
        </div>

        {/* Nota */}
        <p className="text-center text-gray-400 text-sm font-body">
          El registro es rápido y gratuito. Puedes seguir jugando gratis sin
          cuenta.
        </p>
      </div>

      {/* Decoraciones de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl shimmer" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl shimmer" />
      </div>
    </div>
  );
}
