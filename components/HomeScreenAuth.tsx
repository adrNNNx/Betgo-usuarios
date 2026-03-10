// components/HomeScreenAuth.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Gift,
  Dices,
  Timer,
  Sparkles,
  TrendingUp,
  Flame,
  Users,
} from "lucide-react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { RegisterScreen } from "@/components/auth/RegisterScreen";

interface HomeScreenAuthProps {
  barName?: string;
  barSubtitle?: string;
  barImageUrl?: string | null;
  freeSpins?: number;
  jackpotAmount?: number;
  activePlayers?: number;
  onAuthSuccess?: () => void;
  onBack?: () => void;
}

export function HomeScreenAuth({
  barName,
  barSubtitle,
  barImageUrl,
  freeSpins,
  jackpotAmount,
  activePlayers = 47,
  onAuthSuccess,
  onBack,
}: HomeScreenAuthProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const initials = barName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative min-h-screen flex lg:flex-row flex-col overflow-hidden">
      {/* ===== LEFT PANEL: Bar identity ===== */}
      <div className="relative lg:w-1/2 w-full flex flex-col bg-background lg:min-h-screen">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.04] blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[120px]" />

        {/* Decorative rotating ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] animate-spin-slow pointer-events-none">
          <svg viewBox="0 0 550 550" className="w-full h-full opacity-[0.04]">
            <circle
              cx="275"
              cy="275"
              r="265"
              fill="none"
              stroke="hsl(45, 100%, 51%)"
              strokeWidth="1"
              strokeDasharray="10 20"
            />
            <circle
              cx="275"
              cy="275"
              r="220"
              fill="none"
              stroke="hsl(45, 100%, 51%)"
              strokeWidth="0.5"
              strokeDasharray="5 25"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16 gap-6 lg:gap-8">
          <div className="relative">
            {barImageUrl ? (
              <div className="relative">
                {/*Glow */}
                <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-xl scale-110" />
                {/* Logo */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden ">
                  <img
                    src={barImageUrl}
                    alt={`Logo de ${barName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-full bg-primary/5 blur-3xl scale-105" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-2xl">
                  <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                    {initials}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bar name + subtitle */}
          {/* <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance leading-[1.1]">
              {barName}
            </h1>
            {barSubtitle && (
              <p className="text-muted-foreground font-sans text-xs sm:text-sm uppercase tracking-[0.2em]">
                {barSubtitle}
              </p>
            )}
          </div> */}

          {/* Promo card - Ruleta Premiada */}
          <div className="w-full max-w-sm">
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm shadow-xl shadow-background/40 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="p-4 sm:p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h2 className="font-serif text-base sm:text-lg font-bold text-foreground">
                          Ruleta Premiada
                        </h2>
                      </div>
                      <p className="text-muted-foreground font-sans text-xs sm:text-sm leading-relaxed">
                        Premios instantaneos del bar
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-primary/15 text-primary border-primary/25 hover:bg-primary/15 font-sans text-[10px] uppercase tracking-wider px-2">
                      Gratis
                    </Badge>
                  </div>

                  <div className="flex items-center gap-px rounded-lg bg-secondary/30 p-1">
                    <FeatureChip
                      icon={<Dices className="h-3 w-3" />}
                      text={`${freeSpins} jugadas`}
                    />
                    <div className="w-px self-stretch bg-border/20 my-1" />
                    <FeatureChip
                      icon={<Gift className="h-3 w-3" />}
                      text="Premios"
                    />
                    <div className="w-px self-stretch bg-border/20 my-1" />
                    <FeatureChip
                      icon={<Timer className="h-3 w-3" />}
                      text="Cada dia"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pozo Global card */}
          <div className="w-full max-w-sm">
            <Card className="border-primary/20 bg-card/70 backdrop-blur-sm shadow-xl shadow-primary/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]" />
              <CardContent className="p-0 relative z-10">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="p-4 sm:p-5 flex flex-col gap-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-foreground leading-tight">
                          Pozo Global
                        </h3>
                        <p className="text-muted-foreground text-[10px] font-sans">
                          Acumulado actual
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-primary/70">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-[10px] font-sans font-semibold">
                        EN VIVO
                      </span>
                    </div>
                  </div>

                  {/* Jackpot amount */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg" />
                    <div className="relative px-4 py-3">
                      <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-1">
                        PREMIO MAYOR
                      </p>
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-none tracking-tight">
                        Gs. {jackpotAmount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-sans mt-1.5 flex items-center gap-1">
                        <Flame className="h-3 w-3 text-primary/50" />
                        Crece con cada jugada
                      </p>
                    </div>
                  </div>

                  {/* Active players */}
                  <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary/30">
                    <Users className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-xs font-sans text-foreground/80">
                      <span className="font-bold text-primary">
                        {activePlayers}
                      </span>{" "}
                      jugadores activos
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse ml-0.5" />
                    <span className="text-[10px] text-muted-foreground">
                      Abierto
                    </span>
                  </div>
                </div>

                <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-border/20" />
              <Sparkles className="h-3 w-3 text-primary/30" />
              <div className="h-px w-12 bg-border/20" />
            </div>
            <p className="text-muted-foreground/40 text-[10px] font-sans tracking-wider">
              Powered by BetGO
            </p>
          </div>
        </div>
      </div>

      {/* ===== LÍNEA DIVISORIA VERTICAL ===== */}
      <div className="hidden lg:flex items-center justify-center shrink-0 py-20">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-border/30 to-transparent" />
      </div>

      {/* ===== RIGHT PANEL: Auth forms ===== */}
      <div className="relative lg:w-1/2 w-full flex flex-col bg-background lg:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 py-12 lg:py-16">
          <div className="w-full max-w-md">
            {authMode === "login" ? (
              <LoginScreen
                onSuccess={onAuthSuccess}
                onSwitchToRegister={() => setAuthMode("register")}
                onBack={onBack}
              />
            ) : (
              <RegisterScreen
                onSuccess={onAuthSuccess}
                onSwitchToLogin={() => setAuthMode("login")}
                onBack={onBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SUB-COMPONENT ===== */
function FeatureChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1">
      <span className="text-primary/70">{icon}</span>
      <span className="text-foreground/80 font-sans text-[11px] sm:text-xs font-medium">
        {text}
      </span>
    </div>
  );
}
