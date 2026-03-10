// components/InitAuth.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Componente que inicializa la autenticación al montar la app
 * Debe ser usado en el layout raíz
 */
export function InitAuth({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Inicializar autenticación (verifica tokens, programa refresh, etc.)
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
