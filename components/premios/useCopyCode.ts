// components/premios/useCopyCode.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copia al portapapeles con fallback para contextos sin `navigator.clipboard`
 * (http plano en la red del bar, WebViews viejas).
 */
export function useCopyCode(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      const done = () => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      };
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          done();
          return true;
        }
      } catch {
        // cae al fallback
      }
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
        return true;
      } catch {
        return false;
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
