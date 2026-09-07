// app/play/[slug]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useGameStore,
  useBarSymbolsData,
  usePoolSymbolsData,
} from "@/store/useGameStore";
import {
  getBarPublicInfo,
  getActiveBanners,
  type BannerItem,
  type PlayResultResponse,
} from "@/services/game.service";
import {
  getGlobalPrizes,
  getPrizesByBarAndGlobal,
  type PrizeItem,
} from "@/services/prize.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Componentes
import { Header } from "@/components/Header";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  ResultadoScreen,
  type ResultadoOutcome,
} from "@/components/resultado";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { useCopyCode } from "@/components/premios/useCopyCode";
import { SlotMachine } from "@/components/slot-machine";
import {
  PoolBand,
  FreePlayVenue,
  BarPrizesRail,
  PoolHero,
  PayoutScreen,
  screenAura,
} from "@/components/juego";
import { VenueChip } from "@/components/resultado";
import { PREMIOS_RETURN_KEY } from "@/lib/prize-claim";
import { markJackpotContacted } from "@/services/jackpot-claim.service";
import { LoadBalanceModal } from "@/components/LoadBalanceModal";
import { BannerCarousel } from "@/components/BannerCarousel";

// Hooks
import {
  useBarSymbols,
  usePoolSymbols,
  mapServerResultToSlotSymbols,
} from "@/hooks/use-bar-symbols";

// Types
import type { SlotSymbol } from "@/types/slot-machine-type";

type GameScreen =
  | "welcome"
  | "playing-free"
  | "playing-global"
  | "payout-free"
  | "payout-pool"
  | "result";

/**
 * "5 iguales de Trébol" — el combo que salió, tal como lo cuenta el motor.
 *
 * Sólo describe la tirada: puede haber 5 iguales de un símbolo sin premio y
 * `isWinner: false`. Quién decide si se celebra es `isWinner`, no esto.
 */
function comboLabelOf(result: PlayResultResponse) {
  const { matchCount, winningSymbolId } = result;
  if (!matchCount || !winningSymbolId) return undefined;
  const label = result.symbolDetails.find((d) => d.id === winningSymbolId)?.name;
  return label ? `${matchCount} iguales de ${label}` : undefined;
}

const dateTimeFmt = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "12/08/2026 · 20:41" */
function fmtPlayedAt(iso: string): string {
  const p = dateTimeFmt.formatToParts(new Date(iso));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")} · ${get("hour")}:${get("minute")}`;
}

/** Traduce la respuesta del backend al outcome que entiende ResultadoScreen. */
function buildOutcome(
  result: PlayResultResponse,
  barName: string,
  mode: "free" | "pool",
  onContact: (folio: string) => void,
): ResultadoOutcome {
  const comboLabel = comboLabelOf(result);
  const prize = result.prize;

  // El pozo ganado llega como premio sintético con id 'jackpot', no por type.
  // Sus datos de retiro vienen en `result.jackpot`.
  if (prize?.id === "jackpot" && result.jackpot) {
    const j = result.jackpot;
    return {
      kind: "jackpot",
      jackpot: {
        amount: j.amount,
        code: j.folio,
        dateLabel: fmtPlayedAt(j.playedAt),
        shortDateLabel: dateFmt.format(new Date(j.playedAt)),
        playId: `#${result.playId.slice(0, 8)}`,
        venueName: barName,
        comboLabel,
        status: j.status,
        contactHref: j.contactHref,
        onContact: () => onContact(j.folio),
      },
    };
  }

  if (result.isWinner && prize) {
    return {
      kind: "prize",
      prize: {
        name: prize.name,
        imageUrl: prize.imageUrl,
        code: prize.claimCode ?? "",
        qr: prize.claimCode ? (
          <QRCodeDisplay value={prize.claimCode} size={128} quietZone={0} />
        ) : undefined,
        comboLabel,
        // La ventana de reclamo son 7 días (createPrizeClaim en el backend).
        expiryLabel: "Tenés 7 días para reclamarlo",
      },
    };
  }

  return mode === "pool"
    ? {
        kind: "none",
        title: "Saldo insuficiente",
        sub: "Cargá saldo para seguir jugando por el pozo",
      }
    : { kind: "none" };
}

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

  // Símbolos crudos del backend, para la tabla de pagos
  const rawBarSymbols = useBarSymbolsData();
  const rawPoolSymbols = usePoolSymbolsData();

  const { copy: copyCode } = useCopyCode();

  /** Carriles que exige el pozo: sale del símbolo jackpot, cae a 5 si no está. */
  const jackpotMinMatch =
    rawPoolSymbols.find((s) => s.isJackpot)?.minMatchToWin ?? 5;

  /**
   * Cuántos iguales pide cada premio, para el badge del riel.
   * Los símbolos de pozo quedan afuera solos: tienen `prizeId: null`.
   */
  const minMatchByPrizeId = Object.fromEntries(
    rawBarSymbols
      .filter((s) => s.prizeId)
      .map((s) => [s.prizeId as string, s.minMatchToWin ?? 5]),
  );

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
    matchCount?: number;
    winningSymbolId?: string | null;
    prize?: {
      id: string;
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
  /** Premios propios del bar, para el riel de la pantalla gratuita. */
  const [barPrizes, setBarPrizes] = useState<PrizeItem[]>([]);

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
        // El endpoint trae globales + locales; el riel sólo quiere los del bar.
        getPrizesByBarAndGlobal(loadedBar.id)
          .then((all) => setBarPrizes(all.filter((p) => p.barId === loadedBar.id)))
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
        matchCount: result.matchCount,
        winningSymbolId: result.winningSymbolId,
        prize: result.prize
          ? {
              id: result.prize.id,
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
        matchCount: result.matchCount,
        winningSymbolId: result.winningSymbolId,
        prize: result.prize
          ? {
              id: result.prize.id,
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

  // ==================== HANDLER: CONTACTÓ POR EL POZO ====================
  /**
   * El link abre WhatsApp por su cuenta (es un <a> con href). Acá sólo avisamos
   * al backend para que el comprobante pase a `in_review` y administración lo
   * vea en su panel. Si falla, no se interrumpe nada: que el ganador pueda
   * comunicarse importa más que el registro del estado, y el endpoint es
   * idempotente, así que se puede reintentar.
   */
  const handleJackpotContact = useCallback((folio: string) => {
    markJackpotContacted(folio).catch(() => {});
  }, []);

  // ==================== HANDLER: COPIAR CÓDIGO ====================
  // Reusa el hook de Mis Premios: tiene fallback para http plano en el bar.
  const handleCopyCode = useCallback(
    (code: string) => {
      copyCode(code).then((ok) => {
        if (ok) toast.success("Código copiado");
      });
    },
    [copyCode],
  );

  // ==================== HANDLER: MIS PREMIOS ====================
  // Guarda de dónde vino para que el "volver" de /premios sea honesto.
  const handlePrizesClick = () => {
    try {
      sessionStorage.setItem(
        PREMIOS_RETURN_KEY,
        JSON.stringify({ path: `/play/${slug}`, label: bar?.name ?? "" }),
      );
    } catch {
      // sin sessionStorage el volver cae al fallback
    }
    router.push("/premios");
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
            poolPrizes={prizes}
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
          <div
            className="flex min-h-screen flex-col items-center p-4 sm:p-6"
            style={{ background: `${screenAura("free")}, oklch(0.2 0.05 160)` }}
          >
            {/* La única pieza dorada de esta pantalla: por contraste se lee
                como "otro juego, más grande". */}
            <PoolBand
              poolAmount={pool?.currentAmount ?? 0}
              costPerPlay={pool?.costPerPlay ?? 1000}
              prizeCount={prizes.filter((p) => p.isActive).length}
              onPlayPool={handlePlayGlobalPot}
              className="mb-3"
            />

            <BannerCarousel banners={banners} className="mb-3 px-1" />

            <FreePlayVenue
              barName={bar.name}
              barLogoUrl={bar.logoUrl}
              remaining={freePlaysRemaining}
              total={session?.playsLimit ?? bar.freePlaysPerDay}
              className="mb-3"
            />

            <BarPrizesRail
              prizes={barPrizes}
              minMatchByPrizeId={minMatchByPrizeId}
              onSeeAll={() => transitionTo("payout-free")}
              className="mb-4"
            />

            <SlotMachine
              config={{ currency: "Gs." }}
              symbols={symbols}
              usingCustomSymbols={usingCustomSymbols}
              freeSpinsRemaining={freePlaysRemaining}
              onRequestSpin={handleRequestSpin}
              serverResults={serverResults}
              serverResultInfo={serverResultInfo}
              onAnimationComplete={handleAnimationComplete}
              serverError={spinError}
            />

            <button
              onClick={handleBackToHome}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver
            </button>
          </div>
        );

      case "payout-free":
        return (
          <PayoutScreen
            mode="free"
            symbols={rawBarSymbols}
            barName={bar.name}
            poolAmount={pool?.currentAmount ?? 0}
            costPerPlay={pool?.costPerPlay ?? 1000}
            onBack={() => transitionTo("playing-free")}
            onPrimary={handlePlayGlobalPot}
          />
        );

      case "payout-pool":
        return (
          <PayoutScreen
            mode="pool"
            symbols={rawPoolSymbols}
            poolAmount={pool?.currentAmount ?? 0}
            costPerPlay={pool?.costPerPlay ?? 1000}
            onBack={() => transitionTo("playing-global")}
            onPrimary={() => transitionTo("playing-global")}
          />
        );

      case "result":
        return lastResult ? (
          <ResultadoScreen
            venue={{ name: bar.name, logoUrl: bar.logoUrl }}
            outcome={buildOutcome(
              lastResult,
              bar.name,
              lastPlayMode,
              handleJackpotContact,
            )}
            pool={{
              amount: pool?.currentAmount ?? 0,
              balance: user?.balance ?? 0,
              costPerPlay: pool?.costPerPlay ?? 1000,
            }}
            playing={isPlaying}
            onPlayPool={handlePlayGlobalPot}
            onTopUp={() => setShowLoadBalance(true)}
            onMyPrizes={handlePrizesClick}
            onHome={handleBackToHome}
            onCopyCode={handleCopyCode}
          />
        ) : null;

      case "playing-global":
        return (
          <div
            className="flex min-h-screen flex-col items-center p-4 sm:p-6"
            style={{ background: `${screenAura("pool")}, oklch(0.2 0.05 160)` }}
          >
            <BannerCarousel banners={banners} className="mb-3 px-1" />

            <PoolHero
              poolAmount={jackpotDisplayAmount}
              prizes={prizes}
              minMatchToWin={jackpotMinMatch}
              className="mb-3"
            />

            <div className="mb-3">
              <VenueChip name={bar.name} logoUrl={bar.logoUrl} />
            </div>

            <SlotMachine
              config={{ currency: "Gs." }}
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

            <button
              onClick={() => transitionTo("payout-pool")}
              className="mt-4 w-full max-w-2xl rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-sm font-semibold text-primary backdrop-blur-sm transition-colors hover:bg-card/60"
            >
              ¿Cómo se gana?{" "}
              <span className="font-normal text-muted-foreground">
                Ver tabla de pagos →
              </span>
            </button>

            <button
              onClick={handleBackToHome}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver al inicio
            </button>
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
        onPrizesClick={handlePrizesClick}
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
