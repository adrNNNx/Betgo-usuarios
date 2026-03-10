// app/play/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Componentes
import { Header } from "@/components/Header";
import { WelcomeScreen } from "@/components/WelcomeScreen";

import { ResultScreen } from "@/components/ResultScreen";
import { GlobalPotScreen } from "@/components/GlobalPotScreen";

// Types
import type { SymbolType, GameResult } from "@/types/game";
import { formatCurrency } from "@/lib/game-logic";
import { cn } from "@/lib/utils";
import { SlotMachine } from "@/components/slot-machine";

interface BarInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  freeSpinsPerDay: number;
  isActive: boolean;
}

interface BarAccessData extends BarInfo {
  freePlaysAvailable: number;
  freePlaysUsed: number;
  freePlaysTotal: number;
}

interface PlayResult {
  result: {
    symbols: string[];
    hasWon: boolean;
    prize: {
      id: string;
      name: string;
      description: string;
      value: number;
    } | null;
  };
  freePlaysRemaining: number;
}

type GameScreen = "welcome" | "playing-free" | "result" | "playing-global";

export default function BarGamePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Auth
  const { user, isAuthenticated } = useAuthStore();

  // Estados del bar
  const [bar, setBar] = useState<BarAccessData | null>(null);
  const [isLoadingBar, setIsLoadingBar] = useState(true);
  const [barError, setBarError] = useState<string | null>(null);

  // Estados del juego
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSymbols, setCurrentSymbols] = useState<SymbolType[]>([]);
  const [playResult, setPlayResult] = useState<PlayResult | null>(null);

  // Pozo global
  const [potAmount, setPotAmount] = useState(0);
  const spinCost = 2000;

  // ==================== CARGAR INFO PÚBLICA DEL BAR (Sin Auth) ====================
  useEffect(() => {
    const loadPublicBarInfo = async () => {
      try {
        setIsLoadingBar(true);
        setBarError(null);

        const { data } = await api.get(`/game/bar/${slug}/public`);

        if (!isAuthenticated) {
          sessionStorage.setItem("pendingBarInfo", JSON.stringify(data));
          router.push(`/play/${slug}/auth`);
          return;
        }

        // Si está autenticado, cargar data completa
        await loadAuthenticatedBarAccess();
      } catch (error: any) {
        console.error("Error cargando bar:", error);
        setBarError(
          error.response?.data?.message || "Bar no encontrado o no disponible",
        );
        setIsLoadingBar(false);
      }
    };

    if (slug) {
      loadPublicBarInfo();
    }
  }, [slug, isAuthenticated]);

  // ==================== CARGAR INFO COMPLETA DEL BAR (Con Auth) ====================
  const loadAuthenticatedBarAccess = async () => {
    try {
      setIsLoadingBar(true);

      const { data } = await api.get(`/game/bar/${slug}`);

      setBar({
        id: data.bar.id,
        name: data.bar.name,
        slug: data.bar.slug,
        address: data.bar.address || "",
        phone: data.bar.phone || "",
        email: data.bar.email || "",
        logoUrl: data.bar.logoUrl || null,
        freeSpinsPerDay: data.bar.freeSpinsPerDay,
        isActive: data.bar.isActive ?? true,
        freePlaysAvailable: data.session.playsRemaining,
        freePlaysUsed: data.session.playsUsed,
        freePlaysTotal: data.session.playsLimit,
      });

      setPotAmount(data.globalPool?.currentAmount || 0);
    } catch (error: any) {
      console.error("Error accediendo al bar:", error);
      setBarError(error.response?.data?.message || "Error al acceder al bar");
    } finally {
      setIsLoadingBar(false);
    }
  };

  const loadGlobalPool = async () => {
    try {
      const { data } = await api.get("/game/pool/status");
      setPotAmount(data.amount || 0);
    } catch (error) {
      console.error("Error cargando pozo:", error);
    }
  };

  // ==================== HANDLER: JUGAR GRATIS ====================
  const handlePlayFree = async () => {
    if (!bar) return;

    if (bar.freePlaysAvailable <= 0) {
      toast.error("No tienes jugadas gratuitas disponibles en este bar");
      return;
    }

    try {
      setCurrentScreen("playing-free");
      setIsSpinning(true);

      // POST /game/play/free
      const { data } = await api.post<PlayResult>("/game/play/free", {
        barSlug: slug,
      });

      // Guardar resultado
      setPlayResult(data);
      setCurrentSymbols(data.result.symbols as SymbolType[]);

      // Actualizar jugadas restantes
      setBar((prev) =>
        prev
          ? {
              ...prev,
              freePlaysAvailable: data.freePlaysRemaining,
              freePlaysUsed: prev.freePlaysTotal - data.freePlaysRemaining,
            }
          : null,
      );

      // Esperar animación
      setTimeout(() => {
        setIsSpinning(false);
        setCurrentScreen("result");
      }, 3000);
    } catch (error: any) {
      console.error("Error jugando:", error);
      toast.error(
        error.response?.data?.message || "Error al realizar la jugada",
      );
      setIsSpinning(false);
      setCurrentScreen("welcome");
    }
  };

  // ==================== HANDLER: JUGAR POR POZO GLOBAL ====================
  const handlePlayGlobalPot = async () => {
    if (!user || user.balance === undefined) {
      toast.error("Error de usuario o saldo");
      return;
    }

    if (user.balance < spinCost) {
      toast.error("Saldo insuficiente");
      return;
    }

    setCurrentScreen("playing-global");
  };
  // ==================== HANDLER: RESULTADO POZO GLOBAL ====================
  const handleGlobalPotResult = (result: GameResult) => {
    setPlayResult({
      result: {
        symbols: result.symbols,
        hasWon: result.isWin,
        prize: result.prize
          ? {
              id: result.prize.id,
              name: result.prize.name,
              description: result.prize.description,
              value: result.prize.value ?? 0,
            }
          : null,
      },
      freePlaysRemaining: bar?.freePlaysAvailable ?? 0,
    });
    setCurrentScreen("result");
  };

  // ==================== HANDLER: VOLVER AL INICIO ====================
  const handleBackToHome = () => {
    setCurrentScreen("welcome");
    setPlayResult(null);
  };

  // ==================== HANDLER: LOGOUT ====================
  const handleLogout = async () => {
    const { logout } = useAuthStore.getState();
    await logout();
    router.push(`/play/${slug}/auth`);
  };

  // ==================== LOADING STATE ====================
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

  // ==================== ERROR STATE ====================
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

  // ==================== RENDER SCREENS ====================
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
              freeSpinsPerDay: bar.freeSpinsPerDay,
              isActive: bar.isActive,
            }}
            freeSpinsAvailable={bar.freePlaysAvailable}
            // onPlayClick={handlePlayFree}
            onPlayClick={() => setCurrentScreen("playing-free")}
          />
        );

      case "playing-free":
        return (
          <div className="min-h-screen casino-bg flex flex-col items-center justify-center p-4 sm:p-6">
            <SlotMachine
              config={{
                title: bar.name,
                barLogoUrl: bar.logoUrl,
                currency: "Gs",
                freeSpins: bar.freePlaysAvailable,
              }}
              barSlug={bar.slug}
            />
            {/* Decoraciones */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl shimmer" />
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl shimmer" />
            </div>
          </div>
        );

      case "result":
        return playResult ? (
          <ResultScreen
            result={{
              isWin: playResult.result.hasWon,
              symbols: playResult.result.symbols as SymbolType[],
              prize: playResult.result.prize
                ? {
                    id: playResult.result.prize.id,
                    name: playResult.result.prize.name,
                    description: playResult.result.prize.description,
                    value: playResult.result.prize.value,
                    type: "local" as const,
                    stock: 0,
                    isActive: true,
                  }
                : undefined,
              newPotAmount: potAmount,
              newBalance: user?.balance ?? 0,
            }}
            user={{
              id: user?.id || "",
              isAuthenticated: true,
              balance: user?.balance || 0,
              freeSpinsUsed: bar.freePlaysUsed,
              freeSpinsAvailable: bar.freePlaysAvailable,
              name: user?.name ?? undefined,
              email: user?.email ?? undefined,
            }}
            spinCost={spinCost}
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
              freeSpinsUsed: bar.freePlaysUsed,
              freeSpinsAvailable: bar.freePlaysAvailable,
              name: user?.name ?? undefined,
              email: user?.email ?? undefined,
            }}
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
      <Header
        onProfileClick={() => toast.info("Mi Perfil - Por implementar")}
        onPrizesClick={() => toast.info("Mis Premios - Por implementar")}
        onHistoryClick={() => toast.info("Historial - Por implementar")}
        onLogout={handleLogout}
      />

      {/* Contenido */}
      <div className="pt-16">{renderScreen()}</div>
    </>
  );
}
