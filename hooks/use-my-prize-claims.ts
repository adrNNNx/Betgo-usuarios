// hooks/use-my-prize-claims.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  getMyPrizeClaims,
  type MyPrizeClaim,
} from "@/services/prize-claim.service";

export function useMyPrizeClaims() {
  const [claims, setClaims] = useState<MyPrizeClaim[]>([]);
  // El backend pagina de a 50 (DEFAULT_LIMIT). Con `total` sabemos si quedó
  // historial afuera en vez de mostrar una lista incompleta sin avisar.
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRetry = false) => {
    if (isRetry) setIsRetrying(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await getMyPrizeClaims();
      setClaims(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    claims,
    total,
    isLoading,
    isRetrying,
    error,
    retry: () => load(true),
  };
}
