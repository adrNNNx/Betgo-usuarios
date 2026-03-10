// lib/validation.ts

/**
 * Formatea el número de teléfono paraguayo
 * Elimina espacios y prefijos internacionales
 */
export function formatPhoneNumber(phone: string): string {
  if (typeof phone !== "string") return phone;

  let p = phone.replace(/\s+/g, "");

  // Eliminar prefijos
  if (p.startsWith("+595")) p = p.substring(4);
  else if (p.startsWith("595")) p = p.substring(3);
  else if (p.startsWith("0")) p = p.substring(1);

  return p;
}

/**
 * Valida formato de teléfono paraguayo
 * Debe ser 9 dígitos empezando con 9
 */
export function validatePhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(formatted);
}

/**
 * Formatea teléfono para mostrar al usuario
 * Ejemplo: 981123456 -> 0981 123 456
 */
export function displayPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length === 9) {
    return `0${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6)}`;
  }
  return phone;
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de contraseña
 * Debe contener: 1 mayúscula, 1 minúscula, 1 número
 * Mínimo 8 caracteres
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Debe tener al menos 8 caracteres");
  }

  if (password.length > 50) {
    errors.push("No puede tener más de 50 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Obtiene el nivel de fortaleza de la contraseña
 */
export function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Muy débil", color: "bg-red-500" },
    { label: "Débil", color: "bg-orange-500" },
    { label: "Aceptable", color: "bg-yellow-500" },
    { label: "Fuerte", color: "bg-green-500" },
    { label: "Muy fuerte", color: "bg-green-600" },
  ];

  return {
    score,
    ...levels[score],
  };
}

/**
 * Valida que las contraseñas coincidan
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Valida nombre
 */
export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}
