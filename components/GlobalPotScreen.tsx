// components/GlobalPotScreen.tsx
'use client';

import { useState } from 'react';
import { GameResult, User } from '@/types/game';
import { SlotMachine } from './slot-machine/SlotMachine';
import { formatCurrency, simulateSpin } from '@/lib/game-logic';
import { cn } from '@/lib/utils';

interface GlobalPotScreenProps {
  user: User;
  potAmount: number;
  spinCost: number;
  onResult: (result: GameResult) => void;
  onBack: () => void;
}

export function GlobalPotScreen({
  user,
  potAmount,
  spinCost,
  onResult,
  onBack,
}: GlobalPotScreenProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [localPotAmount, setLocalPotAmount] = useState(potAmount);
  const [localBalance, setLocalBalance] = useState(user.balance);

  const handleRequestSpin = async () => {
    if (localBalance < spinCost) return;
    setShowNotification(false);

    const result = await simulateSpin('global-pot', localBalance, localPotAmount, spinCost);
    setLocalBalance(result.newBalance);
    setLocalPotAmount(result.newPotAmount);
  };

  const handleAnimationComplete = () => {
    setShowNotification(true);
    setTimeout(async () => {
      const result = await simulateSpin('global-pot', user.balance, potAmount, spinCost);
      onResult(result);
    }, 2000);
  };

  return (
    <div className="min-h-screen casino-bg flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors font-body"
        >
          ← Volver
        </button>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6">

        {/* Título */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white gold-glow">
            ¡Juega por el Pozo Global!
          </h1>

          <div className="inline-block">
            <div className={cn(
              'bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500',
              'text-white font-display text-xl sm:text-2xl',
              'px-8 py-3 rounded-full',
              'shadow-2xl shadow-yellow-400/50',
              'relative overflow-hidden'
            )}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
              <div className="relative flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <span>SHOW DE PREMIOS</span>
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pozo Global */}
        <div className={cn(
          'w-full max-w-md',
          'bg-gradient-to-br from-gray-800/90 to-gray-900/90',
          'backdrop-blur-sm',
          'rounded-2xl p-6',
          'border-2 border-yellow-600/50',
          'shadow-2xl'
        )}>
          <p className="text-center text-gray-400 font-body text-sm mb-2">
            Pozo Global
          </p>
          <p className="text-center text-yellow-400 font-display text-4xl sm:text-5xl gold-glow">
            {formatCurrency(localPotAmount)}
          </p>
        </div>

        {/* Info de saldo y costo */}
        <div className="w-full max-w-md grid grid-cols-2 gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 font-body text-xs mb-1">Saldo:</p>
            <p className="text-green-400 font-display text-2xl">
              {formatCurrency(localBalance)}
            </p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 font-body text-xs mb-1">Costo:</p>
            <p className="text-white font-display text-2xl">
              {formatCurrency(spinCost)}
            </p>
          </div>
        </div>

        {/* Slot Machine */}
        <div className="w-full">
          <SlotMachine
            symbols={[]}
            freeSpinsRemaining={0}
            mode="pool"
            userBalance={localBalance}
            costPerPlay={spinCost}
            onRequestSpin={handleRequestSpin}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {/* Notificación */}
        {showNotification && (
          <div className={cn(
            'bg-red-500/20 border-2 border-red-400/50',
            'rounded-xl px-6 py-4',
            'backdrop-blur-sm',
            'animate-in fade-in duration-500'
          )}>
            <p className="text-red-400 font-body text-center font-semibold">
              Esta vez no fue. ¡Sigue intentando!
            </p>
          </div>
        )}

        {localBalance < spinCost && (
          <p className="text-center text-gray-400 text-sm font-body">
            No tienes saldo suficiente. Acércate al mozo para cargar más créditos.
          </p>
        )}
      </div>

      {/* Decoraciones de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl shimmer" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
