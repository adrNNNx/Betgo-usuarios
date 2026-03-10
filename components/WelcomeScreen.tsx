// components/WelcomeScreen.tsx
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Gift,
  Dices,
  Timer,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Bar {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  freeSpinsPerDay: number;
  isActive: boolean;
}

interface WelcomeScreenProps {
  bar: Bar;
  freeSpinsAvailable: number;
  onPlayClick: () => void;
}

export function WelcomeScreen({
  bar,
  freeSpinsAvailable,
  onPlayClick,
}: WelcomeScreenProps) {
  if (!bar || !bar.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando información del bar...</p>
      </div>
    );
  }

  // Calcular iniciales del bar
  const initials = bar.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pb-16 gap-10">
        {/* Hero section */}
        <section className="flex flex-col items-center gap-8 w-full max-w-lg">
          {/* Logo del bar con anillos decorativos */}
          <div className="relative opacity-0 animate-fade-in-up">
            {/* Decorative rings */}
            <div className="absolute -inset-4 rounded-full border border-primary/10 animate-spin-slow" />
            <div className="absolute -inset-8 rounded-full border border-dashed border-primary/[0.06]" />

            {bar.logoUrl ? (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-4 ring-offset-background shadow-2xl shadow-primary/20">
                <img
                  src={bar.logoUrl}
                  alt={`Logo de ${bar.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20 ring-2 ring-primary/10 ring-offset-4 ring-offset-background">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-primary">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Nombre del bar como headline principal */}
          <div className="flex flex-col items-center gap-3 opacity-0 animate-fade-in-up animation-delay-100">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-center text-balance leading-[1.1]">
              {bar.name}
            </h1>
            <p className="text-muted-foreground font-sans text-sm sm:text-base text-center max-w-sm leading-relaxed">
              Participa por premios instantáneos jugando a la ruleta premiada
            </p>
          </div>
        </section>

        {/* Features strip - Badges horizontales */}
        <section className="w-full max-w-lg opacity-0 animate-fade-in-up animation-delay-200">
          <div className="flex items-stretch justify-center gap-px">
            <FeaturePill
              icon={<Dices className="h-4 w-4" />}
              value={`${freeSpinsAvailable}`}
              label="Jugadas gratis"
            />
            <div className="w-px self-stretch bg-border/30 mx-1 sm:mx-3" />
            <FeaturePill
              icon={<Gift className="h-4 w-4" />}
              value="Premios"
              label="Del bar"
            />
            <div className="w-px self-stretch bg-border/30 mx-1 sm:mx-3" />
            <FeaturePill
              icon={<Timer className="h-4 w-4" />}
              value="Diario"
              label="Disponible"
            />
          </div>
        </section>

        {/* Promo card */}
        <section className="w-full max-w-lg opacity-0 animate-fade-in-up animation-delay-300">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl shadow-primary/[0.03] overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-5 p-5 sm:p-6">
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                {/* Text */}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-sans text-foreground font-semibold text-sm sm:text-base">
                    {freeSpinsAvailable} jugadas gratuitas disponibles
                  </p>
                  <p className="font-sans text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    ¡Juega gratis y gana premios instantáneos del bar!
                  </p>
                </div>
              </div>
              {/* Bottom accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </CardContent>
          </Card>
        </section>

        {/* CTA Button con shimmer effect */}
        <section className="w-full max-w-lg flex flex-col items-center gap-4 opacity-0 animate-fade-in-up animation-delay-400">
          <Button
            onClick={onPlayClick}
            disabled={freeSpinsAvailable <= 0}
            className={cn(
              "w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "shadow-lg shadow-primary/25",
              "transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0",
              "relative overflow-hidden group",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
            )}
          >
            <span className="uppercase tracking-wider font-sans">
              {freeSpinsAvailable > 0
                ? "Juga Gratis"
                : "Sin jugadas disponibles"}
            </span>
            {freeSpinsAvailable > 0 && (
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            )}

            {/* Shimmer */}
            {freeSpinsAvailable > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
            )}
          </Button>

          {freeSpinsAvailable <= 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Vuelve mañana para obtener más jugadas gratis
            </p>
          )}
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 flex flex-col items-center gap-3 px-5 pb-8">
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
          <Sparkles className="h-3 w-3 text-primary/20" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
        </div>
        <p className="text-muted-foreground/50 text-[11px] font-sans tracking-wide">
          Powered by BetGO
        </p>
      </footer>
    </div>
  );
}

// ===== Component para los badges de features =====
function FeaturePill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-3 sm:px-5 py-2">
      <div className="text-primary/70">{icon}</div>
      <span className="text-foreground font-bold text-sm sm:text-base font-sans">
        {value}
      </span>
      <span className="text-muted-foreground text-[10px] sm:text-xs font-sans uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
