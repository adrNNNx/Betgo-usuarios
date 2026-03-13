// app/play/[slug]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";
import { getBarPublicInfo } from "@/services/game.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Componentes
import { Header } from "@/components/Header";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { GlobalPotScreen } from "@/components/GlobalPotScreen";
import { SlotMachine } from "@/components/slot-machine";

// Hooks
import { useBarSymbols, mapServerResultToSlotSymbols } from "@/hooks/use-bar-symbols";

// Types
import type { SlotSymbol } from "@/types/slot-machine-type";
import type { GameResult, SymbolType } from "@/types/game";
import { formatCurrency } from "@/lib/game-logic";

type GameScreen = "welcome" | "playing-free" | "result" | "playing-global";

export default function BarGamePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Auth store
  const { user, isAuthenticated } = useAuthStore();

  // Game store
  const {
    bar,
    session,
    pool,
    isLoadingBar,
    barError,
    isPlaying,
    lastResult,
    loadBar,
    loadSymbols,
    loadPool,
    play,
    clearResult,
  } = useGameStore();

  // Símbolos transformados para el slot machine
  const { symbols, usingCustomSymbols } = useBarSymbols();

  // Estado local de la UI
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome");
  const [serverResults, setServerResults] = useState<SlotSymbol[] | null>(null);
  const [serverResultInfo, setServerResultInfo] = useState<{
    isWinner: boolean;
    prize?: { name: string; value?: number } | null;
  } | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);

  // ==================== CARGAR BAR AL MONTAR ====================
  useEffect(() => {
    if (!slug) return;

    const initBar = async () => {
      if (!isAuthenticated) {
        // Guardar info pública y redirigir al login
        try {
          const publicInfo = await getBarPublicInfo(slug);
          sessionStorage.setItem("pendingBarInfo", JSON.stringify(publicInfo));
        } catch {
          // No pasa nada si falla
        }
        router.push(`/play/${slug}/auth`);
        return;
      }

      try {
        await Promise.all([loadBar(slug), loadSymbols(slug), loadPool()]);
      } catch (error: any) {
        // El error ya se maneja en el store
        console.error("Error inicializando bar:", error);
      }
    };

    initBar();
  }, [slug, isAuthenticated]);

  // ==================== HANDLER: GIRAR (JUGADA GRATIS) ====================
  const handleRequestSpin = useCallback(async () => {
    if (!bar || !session) return;

    setSpinError(null);

    try {
      const result = await play("free", slug);

      // Mapear los symbolDetails del servidor a SlotSymbol[] para la animación
      const resultSymbols = mapServerResultToSlotSymbols(
        result.symbolDetails,
        symbols
      );
      setServerResults(resultSymbols);
      setServerResultInfo({
        isWinner: result.isWinner,
        prize: result.prize
          ? { name: result.prize.name, value: result.prize.value }
          : null,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al realizar la jugada";
      toast.error(message);
      setSpinError(message);
    }
  }, [bar, session, slug, symbols, play]);

  // ==================== HANDLER: ANIMACIÓN COMPLETA ====================
  const handleAnimationComplete = useCallback(() => {
    // Si no ganó, mostrar pantalla de resultado después de un breve delay
    if (lastResult && !lastResult.isWinner) {
      setTimeout(() => {
        setCurrentScreen("result");
      }, 800);
    }
    // Si ganó, el overlay de victoria se muestra en el SlotMachine
    // y después de 3s podemos ir al resultado
    if (lastResult?.isWinner) {
      setTimeout(() => {
        setCurrentScreen("result");
      }, 3500);
    }
  }, [lastResult]);

  // ==================== HANDLER: JUGAR POR POZO GLOBAL ====================
  const handlePlayGlobalPot = () => {
    if (!user || (user.balance ?? 0) < (pool?.costPerPlay ?? 0)) {
      toast.error("Saldo insuficiente para jugar por el pozo global");
      return;
    }
    setCurrentScreen("playing-global");
  };

  // ==================== HANDLER: VOLVER AL INICIO ====================
  const handleBackToHome = () => {
    setCurrentScreen("welcome");
    setServerResults(null);
    setServerResultInfo(null);
    setSpinError(null);
    clearResult();
  };

  // ==================== HANDLER: RESULTADO POZO GLOBAL ====================
  const handleGlobalPotResult = (result: GameResult) => {
    // Adaptar el resultado del GlobalPotScreen al formato esperado
    setCurrentScreen("result");
  };

  // ==================== HANDLER: LOGOUT ====================
  const handleLogout = async () => {
    useGameStore.getState().reset();
    await useAuthStore.getState().logout();
    router.push(`/play/${slug}/auth`);
  };

  // ==================== LOADING ====================
  if (isLoadingBar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando bar...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (barError || !bar) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold">Bar no encontrado</h1>
          <p className="text-muted-foreground">
            {barError || "El bar que buscas no existe o no está activo."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  const freePlaysRemaining = session?.playsRemaining ?? 0;

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen
            bar={{
              id: bar.id,
              name: bar.name,
              slug: bar.slug,
              logoUrl: bar.logoUrl ?? undefined,
              freeSpinsPerDay: bar.freePlaysPerDay,
              isActive: true,
            }}
            freeSpinsAvailable={freePlaysRemaining}
            onPlayClick={() => {
              setServerResults(null);
              setServerResultInfo(null);
              setSpinError(null);
              clearResult();
              setCurrentScreen("playing-free");
            }}
          />
        );

      case "playing-free":
        return (
          <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
            <SlotMachine
              config={{
                title: bar.name,
                barLogoUrl: bar.logoUrl,
                currency: "Gs.",
                jackpotAmount: pool?.currentAmount ?? 0,
              }}
              symbols={symbols}
              usingCustomSymbols={usingCustomSymbols}
              freeSpinsRemaining={freePlaysRemaining}
              onRequestSpin={handleRequestSpin}
              serverResults={serverResults}
              serverResultInfo={serverResultInfo}
              onAnimationComplete={handleAnimationComplete}
              serverError={spinError}
            />

            {/* Botón volver */}
            <button
              onClick={handleBackToHome}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver
            </button>

            {/* Decoraciones */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
              <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl shimmer" />
            </div>
          </div>
        );

      case "result":
        return lastResult ? (
          <ResultScreen
            result={{
              isWin: lastResult.isWinner,
              symbols: lastResult.symbols as SymbolType[],
              prize: lastResult.prize
                ? {
                    id: lastResult.prize.id,
                    name: lastResult.prize.name,
                    description: lastResult.prize.claimCode
                      ? `Código de reclamo: ${lastResult.prize.claimCode}`
                      : lastResult.prize.name,
                    value: lastResult.prize.value ?? 0,
                    type: lastResult.prize.type === "jackpot" ? "jackpot" : "local",
                    stock: 0,
                    isActive: true,
                  }
                : undefined,
              newPotAmount: pool?.currentAmount ?? 0,
              newBalance: user?.balance ?? 0,
            }}
            user={{
              id: user?.id || "",
              isAuthenticated: true,
              balance: user?.balance || 0,
              freeSpinsUsed: session?.playsUsed ?? 0,
              freeSpinsAvailable: freePlaysRemaining,
              name: user?.name ?? undefined,
              email: user?.email ?? undefined,
            }}
            spinCost={pool?.costPerPlay ?? 2000}
            onPlayGlobalPot={handlePlayGlobalPot}
            onLoadBalance={() => toast.info("Función de carga de saldo")}
            onBackToHome={handleBackToHome}
          />
        ) : null;

      case "playing-global":
        return (
          <GlobalPotScreen
            user={{
              id: user?.id || "",
              isAuthenticated: true,
              balance: user?.balance || 0,
              freeSpinsUsed: session?.playsUsed ?? 0,
              freeSpinsAvailable: freePlaysRemaining,
              name: user?.name ?? undefined,
              email: user?.email ?? undefined,
            }}
            potAmount={pool?.currentAmount ?? 0}
            spinCost={pool?.costPerPlay ?? 2000}
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
      <Header
        onProfileClick={() => toast.info("Mi Perfil - Por implementar")}
        onPrizesClick={() => toast.info("Mis Premios - Por implementar")}
        onHistoryClick={() => toast.info("Historial - Por implementar")}
        onLogout={handleLogout}
      />

      <div className="pt-16">{renderScreen()}</div>
    </>
  );
}
