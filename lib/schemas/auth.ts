import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Regex para validação de senha forte:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),

    email: z
      .email("Email inválido")
      .min(1, "Email é obrigatório")
      .toLowerCase(),

    emailConfirmation: z
      .email("Email inválido")
      .min(1, "Confirmação de email é obrigatória")
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(
        passwordRegex,
        "Senha deve conter: letra maiúscula, número e caractere especial",
      ),

    passwordConfirmation: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.email === data.emailConfirmation, {
    message: "Os emails não coincidem",
    path: ["emailConfirmation"],
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(
        passwordRegex,
        "Senha deve conter: letra maiúscula, número e caractere especial",
      ),

    passwordConfirmation: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

export const checkPasswordStrength = (
  password: string,
): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: "Fraca", color: "red" };
  } else if (score <= 4) {
    return { score, label: "Média", color: "orange" };
  } else {
    return { score, label: "Forte", color: "green" };
  }
};
