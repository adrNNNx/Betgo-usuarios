// components/BetgoFooter.tsx
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetgoFooterProps {
  /** Muestra las líneas decorativas a los lados del ícono (default: true) */
  showDivider?: boolean;
  className?: string;
}

export function BetgoFooter({ showDivider = true, className }: BetgoFooterProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {showDivider ? (
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
          <Sparkles className="h-3 w-3 text-primary/20" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
        </div>
      ) : (
        <Sparkles className="h-3 w-3 text-primary/30" />
      )}
      <p className="text-muted-foreground/50 text-[11px] font-sans tracking-wide">
        Powered by BetGO
      </p>
    </div>
  );
}
