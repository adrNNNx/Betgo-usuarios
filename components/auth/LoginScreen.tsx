// components/auth/LoginScreen.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
  onBack?: () => void;
}

export function LoginScreen({
  onSuccess,
  onSwitchToRegister,
  onBack,
}: LoginScreenProps) {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        phone: data.phone,
        password: data.password,
        deviceInfo: navigator.userAgent,
      });
      onSuccess?.();
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 opacity-0 animate-fade-in-up">
        <h2 className="font-serif text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground tracking-tight">
          Iniciar Sesión
        </h2>
        <p className="text-muted-foreground text-sm font-sans leading-relaxed">
          Ingresa a tu cuenta para jugar y ganar premios
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 lg:gap-5">
        {/* General error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 opacity-0 animate-fade-in-up">
            <p className="text-destructive text-sm text-center font-sans">
              {error}
            </p>
          </div>
        )}

        {/* Phone */}
        <div className="flex flex-col gap-2.5 opacity-0 animate-fade-in-up animation-delay-100">
          <Label
            htmlFor="phone"
            className="text-secondary-foreground font-sans text-sm"
          >
            Teléfono
          </Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="0981 123 456"
              autoComplete="tel"
              disabled={isLoading}
              className={cn(
                "pl-11 h-12 rounded-xl bg-secondary/40 border-border/50 text-foreground placeholder:text-muted-foreground/60",
                "focus-visible:ring-primary/40 focus-visible:border-primary/40 focus-visible:bg-secondary/60",
                "transition-all duration-200",
                errors.phone &&
                  "border-destructive/50 focus-visible:ring-destructive/50",
              )}
            />
          </div>
          {errors.phone && (
            <p className="text-destructive text-xs font-sans pl-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2.5 opacity-0 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-secondary-foreground font-sans text-sm"
            >
              Contraseña
            </Label>
            <button
              type="button"
              className="text-xs text-primary/80 hover:text-primary font-sans transition-colors underline underline-offset-2"
            >
              Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Introduce tu contrasena"
              autoComplete="current-password"
              disabled={isLoading}
              className={cn(
                "pl-11 pr-11 h-12 rounded-xl bg-secondary/40 border-border/50 text-foreground placeholder:text-muted-foreground/60",
                "focus-visible:ring-primary/40 focus-visible:border-primary/40 focus-visible:bg-secondary/60",
                "transition-all duration-200",
                errors.password &&
                  "border-destructive/50 focus-visible:ring-destructive/50",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs font-sans pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="opacity-0 animate-fade-in-up animation-delay-300 pt-1">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full h-12 text-base font-bold rounded-xl",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 shadow-lg shadow-primary/25",
              "transition-all duration-300 relative overflow-hidden",
              !isLoading &&
                "hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0",
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2.5">
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
            {!isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
            )}
          </Button>
        </div>
      </form>

      {/* Switch to register */}
      <div className="opacity-0 animate-fade-in-up animation-delay-400 flex flex-col items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-4 w-full">
          <div className="h-px flex-1 bg-border/30" />
          <span className="text-muted-foreground/50 text-xs font-sans uppercase tracking-wider">
            o
          </span>
          <div className="h-px flex-1 bg-border/30" />
        </div>
        <p className="text-center text-sm text-muted-foreground font-sans">
          {"No tienes una cuenta? "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary/80 font-semibold transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary/60"
            disabled={isLoading}
          >
            Registrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
