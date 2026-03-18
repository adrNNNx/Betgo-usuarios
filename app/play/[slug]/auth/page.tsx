// app/play/[slug]/auth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { HomeScreenAuth } from "@/components/HomeScreenAuth";

interface BarPublicInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  freePlaysPerDay: number;
  isActive: boolean;
}

export default function BarAuthPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { isAuthenticated } = useAuthStore();

  const [barInfo, setBarInfo] = useState<BarPublicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalPool, setGlobalPool] = useState(0);

  // ==================== CARGAR INFO PÚBLICA DEL BAR ====================
  useEffect(() => {
    const loadBarInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cacheKey = `pendingBarInfo-${slug}`;
        const cachedInfo = sessionStorage.getItem(cacheKey);

        if (cachedInfo) {
          const parsed = JSON.parse(cachedInfo);
          if (parsed.slug === slug) {
            setBarInfo(parsed);
            setIsLoading(false);
            return;
          } else {
            sessionStorage.removeItem(cacheKey);
          }
        }
        const { data } = await api.get<BarPublicInfo>(
          `/game/bar/${slug}/public`,
        );

        setBarInfo(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err: any) {
        console.error("Error cargando bar:", err);
        setError(err.response?.data?.message || "Bar no encontrado");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadBarInfo();
    }
  }, [slug]);

  // ==================== CARGAR POZO GLOBAL ====================
  useEffect(() => {
    const loadGlobalPool = async () => {
      try {
        const { data } = await api.get("/game/pool/status");
        setGlobalPool(data.amount || 0);
      } catch (error) {
        console.error("Error cargando pozo:", error);
      }
    };

    loadGlobalPool();
  }, []);

  // ==================== REDIRIGIR SI YA ESTÁ AUTENTICADO ====================
  useEffect(() => {
    if (isAuthenticated && barInfo) {
      const cacheKey = `pendingBarInfo-${slug}`;
      sessionStorage.removeItem(cacheKey);
      router.push(`/play/${slug}`);
    }
  }, [isAuthenticated, barInfo, slug, router]);

  // ==================== HANDLER: AUTH SUCCESS ====================
  const handleAuthSuccess = () => {
    const cacheKey = `pendingBarInfo-${slug}`;
    sessionStorage.removeItem(cacheKey);
    router.push(`/play/${slug}`);
  };

  // ==================== HANDLER: VOLVER ====================
  const handleBack = () => {
    router.push("/");
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando {slug}...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error || !barInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold">Bar no encontrado</h1>
          <p className="text-muted-foreground">
            {error || "El bar que buscas no existe o no está disponible."}
          </p>
          <button onClick={handleBack} className="text-primary hover:underline">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <HomeScreenAuth
      barName={barInfo.name}
      barSubtitle="Barra & Cerveza"
      barImageUrl={barInfo.logoUrl}
      freeSpins={barInfo.freePlaysPerDay}
      jackpotAmount={globalPool}
      activePlayers={47}
      onAuthSuccess={handleAuthSuccess}
      onBack={handleBack}
    />
  );
}
