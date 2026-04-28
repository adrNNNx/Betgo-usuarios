// app/play/[slug]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";
import {
  getBarPublicInfo,
  getActiveBanners,
  type BannerItem,
} from "@/services/game.service";
import {
  getGlobalPrizes,
  type PrizeItem,
} from "@/services/prize.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Componentes
import { Header } from "@/components/Header";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { SlotMachine } from "@/components/slot-machine";
import { LoadBalanceModal } from "@/components/LoadBalanceModal";
import { BannerCarousel } from "@/components/BannerCarousel";
import { PrizesShowcase } from "@/components/PrizesShowcase";
import { PoolPromoStrip } from "@/components/PoolPromoStrip";

// Hooks
import {
  useBarSymbols,
  usePoolSymbols,
  mapServerResultToSlotSymbols,
} from "@/hooks/use-bar-symbols";

// Types
import type { SlotSymbol } from "@/types/slot-machine-type";
import type { SymbolType } from "@/types/game";

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
    loadPoolSymbols,
    loadPool,
    play,
    clearResult,
  } = useGameStore();

  // Símbolos transformados para el slot machine
  const { symbols, usingCustomSymbols } = useBarSymbols();
  const { symbols: poolSymbols, usingCustomSymbols: usingPoolSymbols } =
    usePoolSymbols();

  // Estado local de la UI
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome");
  const [isScreenVisible, setIsScreenVisible] = useState(true);
  const [lastPlayMode, setLastPlayMode] = useState<"free" | "pool">("free");

  const [jackpotDisplayAmount, setJackpotDisplayAmount] = useState(
    pool?.currentAmount ?? 0,
  );
  useEffect(() => {
    setJackpotDisplayAmount(pool?.currentAmount ?? 0);
  }, [pool?.currentAmount]);
  const [serverResults, setServerResults] = useState<SlotSymbol[] | null>(null);
  const [serverResultInfo, setServerResultInfo] = useState<{
    isWinner: boolean;
    prize?: {
      name: string;
      value?: number;
      imageUrl?: string | null;
      claimCode?: string | null;
    } | null;
  } | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [showLoadBalance, setShowLoadBalance] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);

  /**
   * Cambiar pantalla con transición suave.
   * Fade-out (300ms) → cambiar screen → fade-in (300ms).
   */
  const transitionTo = useCallback(
    (screen: GameScreen) => {
      // Si ya estamos en esa pantalla, no hacer nada
      if (screen === currentScreen) return;

      setIsScreenVisible(false); // inicia fade-out

      setTimeout(() => {
        setCurrentScreen(screen); // cambiar pantalla mientras está invisible
        // Pequeño delay para que React pinte el nuevo contenido antes del fade-in
        requestAnimationFrame(() => {
          setIsScreenVisible(true); // inicia fade-in
        });
      }, 280);
    },
    [currentScreen],
  );

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
        await Promise.all([
          loadBar(slug),
          loadSymbols(slug),
          loadPool(),
          loadPoolSymbols(),
        ]);
      } catch (error: any) {
        // El error ya se maneja en el store
        console.error("Error inicializando bar:", error);
      }

      // Cargar banners y premios (no bloquean — son cosméticos)
      const loadedBar = useGameStore.getState().bar;
      if (loadedBar) {
        getActiveBanners(loadedBar.id)
          .then(setBanners)
          .catch(() => {});
        getGlobalPrizes()
          .then(setPrizes)
          .catch(() => {});
      }
    };

    initBar();
  }, [slug, isAuthenticated]);

  // ==================== HANDLER: GIRAR (JUGADA GRATIS) ====================
  const handleRequestSpin = useCallback(async () => {
    if (!bar || !session) return;

    setSpinError(null);
    setLastPlayMode("free");

    try {
      const result = await play("free", slug);

      // Mapear los symbolDetails del servidor a SlotSymbol[] para la animación
      const resultSymbols = mapServerResultToSlotSymbols(
        result.symbolDetails,
        symbols,
      );
      setServerResults(resultSymbols);
      setServerResultInfo({
        isWinner: result.isWinner,
        prize: result.prize
          ? {
              name: result.prize.name,
              value: result.prize.value,
              imageUrl: result.prize.imageUrl ?? null,
              claimCode: result.prize.claimCode ?? null,
            }
          : null,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al realizar la jugada";
      toast.error(message);
      setSpinError(message);
    }
  }, [bar, session, slug, symbols, play]);

  // ==================== HANDLER: GIRAR (POZO GLOBAL) ====================
  const handleRequestPoolSpin = useCallback(async () => {
    if (!bar || !pool) return;

    setSpinError(null);
    setLastPlayMode("pool");

    try {
      const result = await play("pool", slug);

      const resultSymbols = mapServerResultToSlotSymbols(
        result.symbolDetails,
        poolSymbols,
      );
      setServerResults(resultSymbols);
      setServerResultInfo({
        isWinner: result.isWinner,
        prize: result.prize
          ? {
              name: result.prize.name,
              value: result.prize.value,
              imageUrl: result.prize.imageUrl ?? null,
              claimCode: result.prize.claimCode ?? null,
            }
          : null,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al realizar la jugada";
      toast.error(message);
      setSpinError(message);
    }
  }, [bar, pool, slug, poolSymbols, play]);

  // ==================== HANDLER: ANIMACIÓN COMPLETA (FREE) ====================
  const handleAnimationComplete = useCallback(() => {
    const { session: currentSession, lastResult: currentLastResult } =
      useGameStore.getState();
    const remaining = currentSession?.playsRemaining ?? 0;

    if (currentLastResult?.isWinner) {
      setTimeout(() => {
        transitionTo("result");
      }, 3500);
    } else if (remaining <= 0) {
      transitionTo("result");
    } else {
      setServerResults(null);
      setServerResultInfo(null);
      clearResult();
    }
  }, [transitionTo, clearResult]);

  // ==================== HANDLER: ANIMACIÓN COMPLETA (POOL) ====================
  const handlePoolAnimationComplete = useCallback(() => {
    const { lastResult: currentLastResult } = useGameStore.getState();
    const currentBalance = useAuthStore.getState().user?.balance ?? 0;
    const cost = pool?.costPerPlay ?? 0;

    if (currentLastResult?.isWinner) {
      // GANÓ → siempre ir al resultado
      setTimeout(() => {
        transitionTo("result");
      }, 3500);
    } else if (currentBalance < cost) {
      // NO GANÓ y NO tiene saldo → ir al resultado
      transitionTo("result");
    } else {
      // NO GANÓ pero TIENE saldo → quedarse en la máquina
      setServerResults(null);
      setServerResultInfo(null);
      clearResult();
    }
  }, [transitionTo, clearResult, pool]);

  // ==================== HANDLER: JUGAR POR POZO GLOBAL ====================
  const handlePlayGlobalPot = () => {
    if (!user || (user.balance ?? 0) < (pool?.costPerPlay ?? 0)) {
      toast.error("Saldo insuficiente para jugar por el pozo global");
      return;
    }
    // Limpiar estado de la partida anterior
    setServerResults(null);
    setServerResultInfo(null);
    setSpinError(null);
    clearResult();
    transitionTo("playing-global");
  };

  // ==================== HANDLER: VOLVER AL INICIO ====================
  const handleBackToHome = () => {
    transitionTo("welcome");
    setServerResults(null);
    setServerResultInfo(null);
    setSpinError(null);
    clearResult();
    loadPool();
  };

  // ==================== HANDLER: CARGA DE SALDO EXITOSA ====================
  const handleLoadBalanceSuccess = (amount: number) => {
    // Actualizar balance en authStore
    useAuthStore.getState().updateBalance((user?.balance ?? 0) + amount);
    // Refrescar pozo y sesión
    loadPool();
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
            pool={{
              currentAmount: pool?.currentAmount ?? 0,
              costPerPlay: pool?.costPerPlay ?? 1000,
            }}
            userBalance={user?.balance ?? 0}
            banners={banners}
            onPlayClick={() => {
              setServerResults(null);
              setServerResultInfo(null);
              setSpinError(null);
              clearResult();
              transitionTo("playing-free");
            }}
            onPlayPoolClick={handlePlayGlobalPot}
            onLoadBalanceClick={() => setShowLoadBalance(true)}
          />
        );

      case "playing-free":
        return (
          <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
            <BannerCarousel banners={banners} className="mb-3 px-1" />

            <PoolPromoStrip
              prizes={prizes}
              poolAmount={pool?.currentAmount ?? 0}
              costPerPlay={pool?.costPerPlay ?? 1000}
              onPlayPool={handlePlayGlobalPot}
              className="mt-2 mb-2 px-1"
            />

            <SlotMachine
              config={{
                title: bar.name,
                barLogoUrl: bar.logoUrl,
                currency: "Gs.",
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
                    type:
                      lastResult.prize.type === "jackpot" ? "jackpot" : "local",
                    stock: 0,
                    isActive: true,
                    imageUrl: lastResult.prize.imageUrl ?? undefined,
                    claimCode: lastResult.prize.claimCode,
                    claimQrCode: lastResult.prize.claimQrCode,
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
            bar={{
              name: bar.name,
              logoUrl: bar.logoUrl,
            }}
            fromPool={lastPlayMode === "pool"}
            onPlayGlobalPot={handlePlayGlobalPot}
            onLoadBalance={() => setShowLoadBalance(true)}
            onBackToHome={handleBackToHome}
          />
        ) : null;

      case "playing-global":
        return (
          <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
            <BannerCarousel banners={banners} className="mb-3 px-1" />

            <PrizesShowcase prizes={prizes} className="mb-4 px-1" />

            <SlotMachine
              config={{
                title: bar.name,
                barLogoUrl: bar.logoUrl,
                currency: "Gs.",
                jackpotAmount: jackpotDisplayAmount,
              }}
              mode="pool"
              symbols={poolSymbols}
              usingCustomSymbols={usingPoolSymbols}
              freeSpinsRemaining={0}
              userBalance={user?.balance ?? 0}
              costPerPlay={pool?.costPerPlay ?? 1000}
              onRequestSpin={handleRequestPoolSpin}
              serverResults={serverResults}
              serverResultInfo={serverResultInfo}
              onAnimationComplete={handlePoolAnimationComplete}
              serverError={spinError}
            />

            {/* Botón volver */}
            <button
              onClick={handleBackToHome}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver al inicio
            </button>

            {/* Decoraciones */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
              <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl shimmer" />
            </div>
          </div>
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

      <div
        className="pt-16 transition-all duration-300 ease-in-out"
        style={{
          opacity: isScreenVisible ? 1 : 0,
          transform: isScreenVisible ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {renderScreen()}
      </div>

      <LoadBalanceModal
        open={showLoadBalance}
        onOpenChange={setShowLoadBalance}
        userBalance={user?.balance ?? 0}
        onSuccess={handleLoadBalanceSuccess}
      />
    </>
  );
}
