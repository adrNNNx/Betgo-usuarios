// types/auth.ts

// ==================== TIPOS DEL BACKEND ====================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Tiempo en segundos (900 = 15 minutos)
}

export interface AuthenticatedUser {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  role: string;
  isActive: boolean;
  balance?: number; // Para el módulo de juego
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  tokens: TokenPair;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==================== DTOs PARA EL FRONTEND ====================

export interface LoginCredentials {
  phone: string;
  password: string;
  deviceInfo?: string;
}

export interface RegisterCredentials {
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==================== ERRORES ====================

export interface AuthError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// ==================== JWT PAYLOAD ====================

export interface JwtPayload {
  sub: string; // User ID
  phone: string; // Phone number
  role: string; // User role
  type: "access" | "refresh";
  sessionId?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}
