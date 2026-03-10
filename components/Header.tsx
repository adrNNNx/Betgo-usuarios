// components/Header.tsx
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Trophy,
  History,
  LogOut,
  Coins,
  Dices,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onProfileClick?: () => void;
  onPrizesClick?: () => void;
  onHistoryClick?: () => void;
  onLogout?: () => void;
}

export function Header({
  onProfileClick,
  onPrizesClick,
  onHistoryClick,
  onLogout,
}: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Calcular iniciales del nombre
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Formatear teléfono para mostrar solo últimos 3 dígitos
  const formatPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.slice(-3).padStart(phone.length, "*").replace(/(\d{4})/, "$1 ");
  };

  const handleLogout = async () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo BetGO */}
        <div className="flex items-center gap-2">
          <Dices className="h-5 w-5 text-primary" />
          <span className="text-base font-sans font-semibold text-foreground">
            BetGO
          </span>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          {/* Balance badge */}
          <Badge
            variant="secondary"
            className={cn(
              "h-9 px-3 gap-2",
              "bg-primary/10 hover:bg-primary/20",
              "border border-primary/30",
              "text-foreground font-semibold"
            )}
          >
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm">{user.balance?.toLocaleString() || 0}</span>
          </Badge>

          {/* User dropdown */}
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "relative h-10 w-10 rounded-full",
                  "bg-primary hover:bg-primary/90",
                  "transition-all duration-200",
                  isOpen && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                )}
              >
                <span className="text-base font-bold text-primary-foreground">
                  {getInitials(user.name ?? undefined)}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className={cn(
                "w-56 p-2",
                "bg-card/95 backdrop-blur-sm",
                "border border-border/50",
                "shadow-xl"
              )}
            >
              {/* User info header */}
              <DropdownMenuLabel className="pb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {user.name || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none">
                    {formatPhone(user.phone)}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-border/50" />

              {/* Menu items */}
              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(false);
                  onProfileClick?.();
                }}
                className={cn(
                  "gap-3 py-2.5 cursor-pointer",
                  "hover:bg-secondary/80",
                  "focus:bg-secondary/80",
                  "transition-colors"
                )}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mi Perfil</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(false);
                  onPrizesClick?.();
                }}
                className={cn(
                  "gap-3 py-2.5 cursor-pointer",
                  "hover:bg-secondary/80",
                  "focus:bg-secondary/80",
                  "transition-colors"
                )}
              >
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mis Premios</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(false);
                  onHistoryClick?.();
                }}
                className={cn(
                  "gap-3 py-2.5 cursor-pointer",
                  "hover:bg-secondary/80",
                  "focus:bg-secondary/80",
                  "transition-colors"
                )}
              >
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Historial</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border/50" />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className={cn(
                  "gap-3 py-2.5 cursor-pointer",
                  "text-destructive focus:text-destructive",
                  "hover:bg-destructive/10",
                  "focus:bg-destructive/10",
                  "transition-colors"
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/*
 * ✅ CARACTERÍSTICAS:
 * 
 * 1. **Logo BetGO**
 *    - Icono de trébol (Clover)
 *    - Texto "BetGO"
 *    - Alineado a la izquierda
 * 
 * 2. **Badge de Saldo**
 *    - Icono de monedas (Coins)
 *    - Número formateado con miles
 *    - Estilo con bg-primary/10
 * 
 * 3. **Avatar Circular**
 *    - Iniciales del usuario
 *    - Color primary
 *    - Ring animado cuando abre
 * 
 * 4. **Dropdown Menu**
 *    - Mi Perfil
 *    - Mis Premios
 *    - Historial
 *    - Cerrar Sesión (rojo)
 * 
 * 5. **Responsive**
 *    - Funciona en móvil y desktop
 *    - Container con max-width
 * 
 * 6. **Backdrop Blur**
 *    - Fondo semi-transparente
 *    - Blur para efecto moderno
 * 
 * 7. **Callbacks Opcionales**
 *    - onProfileClick
 *    - onPrizesClick
 *    - onHistoryClick
 *    - onLogout
 */
