"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { useLogin, useResendConfirmation } from "@/app/api/auth/mutations";
import { showToast } from "@/components/custom-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  onTransition?: () => void;
}

const LoginForm = ({ onTransition }: LoginFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin();
  const { mutate: resend, isPending: isResending } = useResendConfirmation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = (data: LoginFormData) => {
    setUnconfirmedEmail(null);
    login(data, {
      onSuccess: (response) => {
        if ("error" in response) {
          showToast({
            type: "error",
            title: "Erro ao fazer login",
            description: response.error as string,
          });
          return;
        }

        onTransition?.();
        router.push(redirectTo || "/dashboard");
      },
      onError: (error: Error & { status?: number }) => {
        const message = error.message || "Verifique suas credenciais.";
        const isUnconfirmed =
          error.status === 403 && /n[ãa]o confirmado/i.test(message);

        if (isUnconfirmed) {
          setUnconfirmedEmail(data.email);
          showToast({
            type: "error",
            title: "Email não confirmado",
            description:
              "Confirme seu email pelo link enviado para ativar a conta.",
          });
          return;
        }

        showToast({
          type: "error",
          title: "Erro ao fazer login",
          description: message,
        });
      },
    });
  };

  const handleResend = () => {
    if (!unconfirmedEmail) return;
    resend(
      { email: unconfirmedEmail },
      {
        onSuccess: () => {
          showToast({
            type: "success",
            title: "Link reenviado",
            description:
              "Se houver uma conta pendente para esse email, um novo link foi enviado.",
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            title: "Falha ao reenviar",
            description: error.message,
          });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <div className="space-y-1.5">
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="email"
            type="email"
            placeholder="seuemail@dominio.com"
            {...register("email")}
            disabled={isPending}
            className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
              errors.email
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            {...register("password")}
            disabled={isPending}
            className={`bg-input text-foreground placeholder:text-muted-foreground pr-10 pl-9 ${
              errors.password
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {unconfirmedEmail && (
        <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-3">
          <p className="text-foreground text-xs">
            Enviamos um link de confirmação para{" "}
            <span className="font-medium">{unconfirmedEmail}</span>. Não recebeu?
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? "Reenviando..." : "Reenviar email de confirmação"}
          </Button>
        </div>
      )}

      <div className="pt-6">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full"
          disabled={!isValid || isPending}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Entrando...
            </div>
          ) : (
            "Iniciar sessão"
          )}
        </Button>
      </div>

      <div className="text-center">
        <Link
          href="/reset-password"
          className="text-foreground hover:text-primary text-sm transition-colors"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground text-xs">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Cadastre-se agora!
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
