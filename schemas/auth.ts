// schemas/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(/^[0-9\s]+$/, "Solo se permiten números")
    .refine(
      (val) => {
        // Eliminar espacios y validar formato paraguayo
        const cleanPhone = val.replace(/\s/g, "");
        return /^09\d{8,9}$/.test(cleanPhone);
      },
      {
        message: "Ingrese un teléfono válido (ej: 0981123456)",
      },
    )
    .transform((val) => val.replace(/\s/g, "")),

  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de validación para Registro
 *
 * Características:
 * - Validación de fortaleza de contraseña
 * - Validación de email opcional
 * - Confirmación de contraseña
 * - Nombre opcional con validación
 */
export const registerSchema = z
  .object({
    phone: z
      .string()
      .min(1, "El teléfono es requerido")
      .regex(/^[0-9\s]+$/, "Solo se permiten números")
      .refine(
        (val) => {
          const cleanPhone = val.replace(/\s/g, "");
          return /^09\d{8,9}$/.test(cleanPhone);
        },
        {
          message: "Ingrese un teléfono válido (ej: 0981123456)",
        },
      )
      .transform((val) => val.replace(/\s/g, "")),

    email: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        },
        {
          message: "Ingrese un email válido",
        },
      )
      .transform((val) => val?.toLowerCase().trim()),

    name: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true;
          return val.trim().length >= 2;
        },
        {
          message: "El nombre debe tener al menos 2 caracteres",
        },
      )
      .transform((val) => val?.trim()),

    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),

    confirmPassword: z.string().min(1, "Debe confirmar su contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.input<typeof registerSchema>;

/**
 * Función auxiliar para obtener la fortaleza de la contraseña
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels = [
    { label: "Muy débil", color: "bg-red-500" },
    { label: "Débil", color: "bg-orange-500" },
    { label: "Aceptable", color: "bg-yellow-500" },
    { label: "Fuerte", color: "bg-lime-500" },
    { label: "Muy fuerte", color: "bg-green-500" },
  ];

  return { score, ...labels[score] };
}
