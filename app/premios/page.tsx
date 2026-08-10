// app/premios/page.tsx
"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Header } from "@/components/Header";
import { MisPremiosScreen } from "@/components/premios/MisPremiosScreen";
import { PREMIOS_RETURN_KEY } from "@/lib/prize-claim";
import { toast } from "sonner";

interface ReturnTo {
  path: string;
  label: string;
}

// sessionStorage no cambia mientras la pantalla está abierta: no hay a qué
// suscribirse. En el server no existe, por eso el snapshot server es null.
const noSubscribe = () => () => {};
const readReturnTo = () => sessionStorage.getItem(PREMIOS_RETURN_KEY);
const noReturnTo = () => null;

export default function PremiosPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const raw = useSyncExternalStore(noSubscribe, readReturnTo, noReturnTo);
  const returnTo = useMemo<ReturnTo | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ReturnTo;
    } catch {
      return null; // sin origen usable, se usa el fallback
    }
  }, [raw]);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const goBack = () => {
    router.push(returnTo?.path || "/");
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.push("/");
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Header
        onProfileClick={() => toast.info("Mi Perfil - Por implementar")}
        onPrizesClick={() => {}}
        onHistoryClick={() => toast.info("Historial - Por implementar")}
        onLogout={handleLogout}
      />

      <main className="min-h-screen casino-bg pt-16">
        <MisPremiosScreen
          onBack={goBack}
          backLabel={
            returnTo?.label ? `Volver a ${returnTo.label}` : "Volver al inicio"
          }
          onPlay={goBack}
        />
      </main>
    </>
  );
}
