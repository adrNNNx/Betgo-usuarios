// components/LoadBalanceQR.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadBalanceQRProps {
  userId: string;
  onBack: () => void;
  onSuccess?: (amount: number) => void;
}

export function LoadBalanceQR({ userId, onBack, onSuccess }: LoadBalanceQRProps) {
  const [qrCode, setQrCode] = useState('');
  const [expiresIn, setExpiresIn] = useState(120); // 2 minutos
  const [isExpired, setIsExpired] = useState(false);
  
  // Generar código QR (en producción vendría del backend)
  useEffect(() => {
    generateQRCode();
  }, []);
  
  // Countdown del temporizador
  useEffect(() => {
    if (expiresIn <= 0) {
      setIsExpired(true);
      return;
    }
    
    const timer = setInterval(() => {
      setExpiresIn(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresIn]);
  
  const generateQRCode = () => {
    // En producción: POST /api/user/generate-qr
    const code = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    setQrCode(code);
    setExpiresIn(120);
    setIsExpired(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors font-body"
          >
            ← Volver
          </button>
        </div>
        
        {/* Título */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl text-white">
            Cargar Saldo
          </h1>
          <p className="text-gray-300 font-body text-sm">
            Muestra este código QR al mozo para cargar saldo
          </p>
        </div>
        
        {/* QR Code Card */}
        <div className={cn(
          'bg-gradient-to-br from-gray-800/90 to-gray-900/90',
          'backdrop-blur-sm',
          'rounded-2xl p-6',
          'border-2',
          isExpired ? 'border-red-500/50' : 'border-yellow-600/50',
          'shadow-2xl',
          'space-y-4'
        )}>
          
          {/* QR Code Display */}
          <div className={cn(
            'bg-white rounded-xl p-6',
            'flex items-center justify-center',
            'min-h-[280px]',
            isExpired && 'opacity-50'
          )}>
            {/* En producción usar una librería de QR como 'qrcode.react' */}
            <div className="text-center">
              <div className="text-8xl mb-4">📱</div>
              <div className="text-gray-800 font-mono text-xs break-all">
                {qrCode}
              </div>
            </div>
          </div>
          
          {/* Código alfanumérico */}
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2">Código alfanumérico:</p>
            <p className={cn(
              'font-mono text-lg',
              isExpired ? 'text-red-400' : 'text-yellow-400'
            )}>
              {qrCode}
            </p>
          </div>
          
          {/* Temporizador */}
          <div className={cn(
            'text-center p-3 rounded-lg',
            isExpired ? 'bg-red-500/20 border border-red-400/50' : 'bg-green-500/20 border border-green-400/50'
          )}>
            <p className={cn(
              'font-body text-sm font-semibold',
              isExpired ? 'text-red-400' : 'text-green-400'
            )}>
              {isExpired ? '⏰ Código Expirado' : `⏱️ Expira en ${formatTime(expiresIn)}`}
            </p>
          </div>
        </div>
        
        {/* Botón de regenerar */}
        {isExpired && (
          <button
            onClick={generateQRCode}
            className={cn(
              'w-full',
              'bg-gradient-to-r from-yellow-400 to-yellow-500',
              'hover:from-yellow-500 hover:to-yellow-600',
              'text-green-900 font-display text-xl font-black',
              'py-4 px-6',
              'rounded-full',
              'shadow-xl hover:shadow-yellow-400/50',
              'transition-all duration-300',
              'hover:scale-[1.02]'
            )}
          >
            Nuevo código
          </button>
        )}
        
        {/* Instrucciones */}
        <div className={cn(
          'bg-blue-500/10 border border-blue-400/30',
          'rounded-xl p-4',
          'space-y-2'
        )}>
          <p className="text-blue-400 font-body text-sm font-semibold mb-2">
            📋 Instrucciones:
          </p>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside font-body">
            <li>Acércate a un mozo del bar</li>
            <li>Muéstrale este código QR o código alfanumérico</li>
            <li>El mozo escaneará el código</li>
            <li>Indica cuánto saldo deseas cargar</li>
            <li>Realiza el pago y recibirás tu saldo inmediatamente</li>
          </ol>
        </div>
        
        {/* Advertencia */}
        <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
          <p className="text-yellow-400 text-xs text-center font-body">
            ⚠️ Este código es de uso único y expira en {formatTime(expiresIn)}
          </p>
        </div>
      </div>
      
      {/* Decoraciones */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl shimmer" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
      </div>
    </div>
  );
}
