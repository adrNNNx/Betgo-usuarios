// components/InitAuth.tsx
"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Bloquea el render de la app hasta que la inicialización de auth termine.
 * Evita que las páginas hagan requests con tokens expirados antes de que
 * initialize() tenga chance de refrescarlos o hacer logout.
 */
export function InitAuth({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
