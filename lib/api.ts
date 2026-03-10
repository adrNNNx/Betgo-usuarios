// lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de Request
 * Agrega automáticamente el token a todas las peticiones
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor de Response
 * Maneja automáticamente errores y refresh de tokens
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/logout",
    ];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint),
    );

    const hasBeenRetried = originalRequest?._retry;

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !hasBeenRetried &&
      originalRequest
    ) {
      originalRequest._retry = true;
      try {
        await useAuthStore.getState().refreshAccessToken();
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Helper para manejo de errores de API
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message || error.message || "Error desconocido"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Error desconocido";
}
