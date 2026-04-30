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
    <div className="bg-muted space-y-2 rounded-md p-3">
      <p className="text-muted-foreground text-xs">
        Força:{" "}
        <span className={`font-semibold text-${colorClass}`}>
          {passwordStrength.label}
        </span>
      </p>

      <div className="grid grid-cols-6 gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
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

      <p className="text-muted-foreground pt-1 text-xs">
        Deve conter pelo menos
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2
            className={`h-3.5 w-3.5 ${/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            className={
              /[A-Z]/.test(password)
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            Pelo menos 1 letra maiúscula
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2
            className={`h-3.5 w-3.5 ${/\d/.test(password) ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            className={
              /\d/.test(password) ? "text-foreground" : "text-muted-foreground"
            }
          >
            Pelo menos 1 número
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2
            className={`h-3.5 w-3.5 ${password.length >= 8 ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
            className={
              password.length >= 8 ? "text-foreground" : "text-muted-foreground"
            }
          >
            Pelo menos 8 caracteres
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2
            className={`h-3.5 w-3.5 ${/[@$!%*?&#]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}
          />
          <span
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
