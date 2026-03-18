// store/useAuthStore-AXIOS.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthenticatedUser,
  LoginResponse,
  RefreshResponse,
} from "@/types/auth";

interface AuthState {
  // Estado
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateUser: (user: Partial<AuthenticatedUser>) => void;
  clearError: () => void;
  initialize: () => Promise<void>;

  updateBalance: (newBalance: number) => void;
  incrementBalance: (amount: number) => void;
  decrementBalance: (amount: number) => void;
  refreshBalance: () => Promise<void>;
}

let refreshTokenTimeout: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: true,
      isLoading: false,
      error: null,

      // ==================== LOGIN ====================
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post<LoginResponse>("/auth/login", {
            ...credentials,
            deviceInfo: credentials.deviceInfo || navigator.userAgent,
          });

          set({
            user: data.user,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          scheduleTokenRefresh(data.tokens.expiresIn);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Error al iniciar sesión";
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ==================== REGISTRO ====================
      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post<LoginResponse>(
            "/auth/register",
            credentials,
          );

          set({
            user: data.user,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          scheduleTokenRefresh(data.tokens.expiresIn);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Error al registrarse";
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ==================== REFRESH TOKEN ====================
      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            throw new Error("No hay refresh token disponible");
          }

          const { data } = await api.post<RefreshResponse>("/auth/refresh", {
            refreshToken,
          });

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });

          scheduleTokenRefresh(data.expiresIn);
        } catch (error: any) {
          console.error("Error al refrescar token:", error);
          get().logout();
        }
      },

      // ==================== LOGOUT ====================
      logout: async () => {
        try {
          const { refreshToken, accessToken } = get();

          if (refreshTokenTimeout) {
            clearTimeout(refreshTokenTimeout);
            refreshTokenTimeout = null;
          }

          if (refreshToken && accessToken) {
            try {
              await api.post("/auth/logout", { refreshToken });
            } catch (error) {
              console.error("Error al cerrar sesión en el servidor:", error);
            }
          }
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // ==================== ACTUALIZAR USUARIO ====================
      updateUser: (updatedUser: Partial<AuthenticatedUser>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updatedUser } });
        }
      },

      // ==================== LIMPIAR ERROR ====================
      clearError: () => {
        set({ error: null });
      },

      // ==================== INICIALIZAR ====================
      initialize: async () => {
        const { accessToken, refreshToken } = get();

        if (accessToken && refreshToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            const expiresIn = payload.exp - Math.floor(Date.now() / 1000);

            if (expiresIn > 0) {
              scheduleTokenRefresh(expiresIn);
              set({ isAuthenticated: true, isInitializing: false });
            } else {
              await get().refreshAccessToken();
              set({ isInitializing: false });
            }
          } catch (error) {
            console.error("Error al inicializar autenticación:", error);
            await get().logout();
            set({ isInitializing: false });
          }
        } else {
          set({ isInitializing: false });
        }
      },

      updateBalance: (newBalance: number) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              balance: newBalance,
            },
          });
        }
      },

      incrementBalance: (amount: number) => {
        const { user } = get();
        if (user) {
          const newBalance = (user.balance ?? 0) + amount;
          set({
            user: {
              ...user,
              balance: newBalance,
            },
          });
        }
      },

      decrementBalance: (amount: number) => {
        const { user } = get();
        if (user) {
          const newBalance = Math.max(0, (user.balance ?? 0) - amount);
          set({
            user: {
              ...user,
              balance: newBalance,
            },
          });
        }
      },

      refreshBalance: async () => {
        try {
          const { data } = await api.get("/users/me");
          const { user } = get();
          if (user) {
            set({
              user: {
                ...user,
                balance: data.balance,
              },
            });
          }
        } catch (error: any) {
          console.error("Error al refrescar balance:", error);
          throw error;
        }
      },
    }),
    {
      name: "betgo-auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // isInitializing NO se persiste: siempre arranca en true para bloquear el render
      }),
    },
  ),
);

function scheduleTokenRefresh(expiresIn: number): void {
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
  }

  const refreshTime = (expiresIn - 60) * 1000;

  if (refreshTime > 0) {
    refreshTokenTimeout = setTimeout(() => {
      useAuthStore.getState().refreshAccessToken();
    }, refreshTime);
  }
}

export const useAccessToken = () => {
  return useAuthStore((state) => state.accessToken);
};

export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

export const useBalance = () => {
  return useAuthStore((state) => state.user?.balance ?? 0);
};

export const useBalanceActions = () => {
  return useAuthStore((state) => ({
    updateBalance: state.updateBalance,
    incrementBalance: state.incrementBalance,
    decrementBalance: state.decrementBalance,
    refreshBalance: state.refreshBalance,
  }));
};
