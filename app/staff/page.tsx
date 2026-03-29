// app/staff/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";
import { getMyStaffProfile, type StaffProfile } from "@/services/staff.service";
import { Loader2 } from "lucide-react";
import { StaffPanel } from "@/components/staff/StaffPanel";

export default function StaffPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing, logout } = useAuthStore();

  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated || !user) {
      router.replace("/");
      return;
    }

    // Solo staff y admin pueden acceder
    if (user.role !== "staff" && user.role !== "admin") {
      const gameBarSlug = useGameStore.getState().bar?.slug;
      const pendingRaw = sessionStorage.getItem("pendingBarInfo");
      const sessionBarSlug = pendingRaw ? JSON.parse(pendingRaw).slug : null;
      const barSlug = gameBarSlug || sessionBarSlug;
      router.replace(barSlug ? `/play/${barSlug}` : "/");
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getMyStaffProfile();
        setStaffProfile(profile);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error al cargar perfil de staff"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, isInitializing, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  // Initializing
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !staffProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">
            {error || "No se pudo cargar el perfil de staff."}
          </p>
          <button
            onClick={() => router.replace("/")}
            className="text-primary hover:underline text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <StaffPanel
      profile={staffProfile}
      onLogout={handleLogout}
    />
  );
}
