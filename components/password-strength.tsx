"use client";

import { CheckCircle2 } from "lucide-react";
import { checkPasswordStrength } from "@/lib/schemas/auth";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password || password.length === 0) return null;

  const passwordStrength = checkPasswordStrength(password);

  const colorClass =
    passwordStrength.color === "red"
      ? "red-500"
      : passwordStrength.color === "orange"
        ? "orange-500"
        : "green-500";

  return (
    <div
      data-testid="password-strength"
      data-color={passwordStrength.color}
      data-score={passwordStrength.score}
      className="bg-muted space-y-2 rounded-md p-3"
    >
      <p
        data-testid="password-strength-label-row"
        className="text-muted-foreground text-xs"
      >
        Força:{" "}
        <span
          data-testid="password-strength-label"
          className={`font-semibold text-${colorClass}`}
        >
          {passwordStrength.label}
        </span>
      </p>

      <div
        data-testid="password-strength-bars"
        className="grid grid-cols-6 gap-1.5"
      >
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            data-testid={`password-strength-bar-${level}`}
            data-filled={passwordStrength.score >= level ? "true" : "false"}
            className={`h-1 rounded-full transition-all duration-300 ${
              passwordStrength.score >= level
                ? passwordStrength.color === "red"
                  ? "bg-red-500"
                  : passwordStrength.color === "orange"
                    ? "bg-orange-500"
                    : "bg-green-500"
                : "bg-border"
            }`}
          />
        ))}
      </div>

      <p
        data-testid="password-strength-rules-title"
        className="text-muted-foreground pt-1 text-xs"
      >
        Deve conter pelo menos
      </p>

      <div data-testid="password-strength-rules" className="space-y-1.5">
        <div
          data-testid="password-strength-rule-uppercase"
          data-met={/[A-Z]/.test(password) ? "true" : "false"}
          className="flex items-center gap-2 text-xs"
        >
          <CheckCircle2
            data-testid="password-strength-rule-uppercase-icon"
            className={`h-3.5 w-3.5 ${/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            data-testid="password-strength-rule-uppercase-label"
            className={
              /[A-Z]/.test(password)
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            Pelo menos 1 letra maiúscula
          </span>
        </div>
        <div
          data-testid="password-strength-rule-digit"
          data-met={/\d/.test(password) ? "true" : "false"}
          className="flex items-center gap-2 text-xs"
        >
          <CheckCircle2
            data-testid="password-strength-rule-digit-icon"
            className={`h-3.5 w-3.5 ${/\d/.test(password) ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            data-testid="password-strength-rule-digit-label"
            className={
              /\d/.test(password) ? "text-foreground" : "text-muted-foreground"
            }
          >
            Pelo menos 1 número
          </span>
        </div>
        <div
          data-testid="password-strength-rule-min-length"
          data-met={password.length >= 8 ? "true" : "false"}
          className="flex items-center gap-2 text-xs"
        >
          <CheckCircle2
            data-testid="password-strength-rule-min-length-icon"
            className={`h-3.5 w-3.5 ${password.length >= 8 ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            data-testid="password-strength-rule-min-length-label"
            className={
              password.length >= 8 ? "text-foreground" : "text-muted-foreground"
            }
          >
            Pelo menos 8 caracteres
          </span>
        </div>
        <div
          data-testid="password-strength-rule-special"
          data-met={/[@$!%*?&#]/.test(password) ? "true" : "false"}
          className="flex items-center gap-2 text-xs"
        >
          <CheckCircle2
            data-testid="password-strength-rule-special-icon"
            className={`h-3.5 w-3.5 ${/[@$!%*?&#]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            data-testid="password-strength-rule-special-label"
            className={
              /[@$!%*?&#]/.test(password)
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            Pelo menos 1 caractere especial
          </span>
        </div>
      </div>
    </div>
  );
}
