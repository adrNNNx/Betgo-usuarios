// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { SlotMachine } from "@/components/slot-machine/SlotMachine";
import { ResultScreen } from "@/components/ResultScreen";
import { GlobalPotScreen } from "@/components/GlobalPotScreen";
import { Header } from "@/components/Header";
import { GameResult, Bar, SymbolType } from "@/types/game";
import {
  simulateSpin,
  generateSlotResult,
  DEFAULT_SYMBOLS,
  formatCurrency,
} from "@/lib/game-logic";
import { cn } from "@/lib/utils";

type GameScreen = "welcome" | "playing-free" | "result" | "playing-global";

export default function Home() {
  // Estado de autenticación desde Zustand
  const { user, isAuthenticated, logout } = useAuthStore();

  // Estado del juego
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSymbols, setCurrentSymbols] = useState<SymbolType[]>(
    generateSlotResult(DEFAULT_SYMBOLS),
  );
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [freeSpinsAvailable, setFreeSpinsAvailable] = useState(3);

  // Estado del bar (simulado)
  const [bar] = useState<Bar>({
    id: "mariscal",
    name: "El Mariscal",
    slug: "el-mariscal",
    location: "Asunción",
    freeSpinsPerDay: 3,
    distribution: {
      bar: 50,
      pot: 30,
      company: 20,
    },
    isActive: true,
  });

  // Pozo global
  const [potAmount, setPotAmount] = useState(32000); // Gs. 32.000
  const spinCost = 2000; // Gs. 2.000

  // Usuario para el juego (combina datos de auth store con datos del juego)
  const gameUser = {
    id: user?.id || "guest",
    isAuthenticated,
    balance: user?.balance || 0,
    freeSpinsUsed: 3 - freeSpinsAvailable,
    freeSpinsAvailable,
    name: user?.name || undefined,
    email: user?.email || undefined,
  };

  // Handlers
  const handleProfileClick = () => {
    alert("Mi Perfil - Por implementar");
  };

  const handlePrizesClick = () => {
    alert("Mis Premios - Por implementar");
  };

  const handleHistoryClick = () => {
    alert("Historial - Por implementar");
  };

  const handlePlayFree = async () => {
    if (freeSpinsAvailable <= 0) {
      alert("No tienes jugadas gratuitas disponibles");
      return;
    }

    setCurrentScreen("playing-free");
    setIsSpinning(true);

    const result = await simulateSpin(
      "free",
      gameUser.balance,
      potAmount,
      spinCost,
    );

    setCurrentSymbols(result.symbols);
    setFreeSpinsAvailable((prev) => prev - 1);
  };

  const handleSpinComplete = (symbols: SymbolType[]) => {
    setIsSpinning(false);

    setTimeout(async () => {
      const result = await simulateSpin(
        "free",
        gameUser.balance,
        potAmount,
        spinCost,
      );
      setGameResult(result);
      setPotAmount(result.newPotAmount);
      setCurrentScreen("result");
    }, 500);
  };

  const handlePlayGlobalPot = () => {
    if (!isAuthenticated) {
      window.location.href = `/play/${bar.slug}/auth`;
      return;
    }

    if ((user?.balance || 0) < spinCost) {
      alert("Saldo insuficiente");
      return;
    }

    setCurrentScreen("playing-global");
  };

  const handleGlobalPotResult = (result: GameResult) => {
    setGameResult(result);
    setPotAmount(result.newPotAmount);
    setCurrentScreen("result");
  };

  const handleBackToHome = () => {
    setCurrentScreen("welcome");
    setGameResult(null);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen("welcome");
  };

  // Renderizar pantalla actual
  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen
            bar={bar}
            freeSpinsAvailable={freeSpinsAvailable}
            pool={{ currentAmount: potAmount, costPerPlay: spinCost }}
            userBalance={user?.balance ?? 0}
            banners={[]}
            onPlayClick={handlePlayFree}
            onPlayPoolClick={handlePlayGlobalPot}
            onLoadBalanceClick={() =>
              alert("Función de carga de saldo - integrar con QR del mozo")
            }
          />
        );

      case "playing-free":
        return (
          <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">

              {/* Slot Machine */}
              <SlotMachine
                symbols={[]}
                freeSpinsRemaining={freeSpinsAvailable}
                onRequestSpin={handlePlayFree}
              />


            {/* Decoraciones */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl shimmer" />
            </div>
          </div>
        );

      case "result":
        return gameResult ? (
          <ResultScreen
            result={gameResult}
            user={gameUser}
            spinCost={spinCost}
            bar={{ name: bar.name, logoUrl: bar.logoUrl }}
            onPlayGlobalPot={handlePlayGlobalPot}
            onLoadBalance={() =>
              alert("Función de carga de saldo - integrar con QR del mozo")
            }
            onBackToHome={handleBackToHome}
          />
        ) : null;

      case "playing-global":
        return (
          <GlobalPotScreen
            user={gameUser}
            potAmount={potAmount}
            spinCost={spinCost}
            onResult={handleGlobalPotResult}
            onBack={handleBackToHome}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      {isAuthenticated && user && (
        <Header
          onProfileClick={handleProfileClick}
          onPrizesClick={handlePrizesClick}
          onHistoryClick={handleHistoryClick}
          onLogout={handleLogout}
        />
      )}

      {/* Contenido principal */}
      <div className={isAuthenticated ? "pt-16" : ""}>{renderScreen()}</div>
    </>
  );
}
