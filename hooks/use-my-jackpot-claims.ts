// hooks/use-my-jackpot-claims.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  getMyJackpotClaims,
  type MyJackpotClaim,
} from "@/services/jackpot-claim.service";

/**
 * Comprobantes de pozo del usuario.
 *
 * Va aparte de `useMyPrizeClaims` a propósito: son dos recursos distintos, con
 * estados distintos, y el fallo de uno no tiene por qué tumbar al otro.
 */
export function useMyJackpotClaims() {
  const [claims, setClaims] = useState<MyJackpotClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyJackpotClaims();
      setClaims(res.data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { claims, isLoading, error, retry: load };
}
