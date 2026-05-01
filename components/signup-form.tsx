"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/schemas/auth";
import { useSignup } from "@/app/api/auth/mutations";
import { UserRole } from "@/app/api/auth/types";
import { showToast } from "@/components/custom-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import PasswordStrength from "@/components/password-strength";
import Link from "next/link";

interface SignUpProps {
  onTransition?: () => void;
}

const SignUp = ({ onTransition }: SignUpProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { mutate: signup, isPending, error: mutationError } = useSignup();

  // Cadastro pós-checkout: o link de "crie sua senha" carrega
  // ?clienteId=...&role=COMPRADOR pra vincular o usuário ao Cliente master
  // criado em /api/vendas/checkout. Sem esses params, signup vira VENDEDOR
  // (fluxo padrão da landing).
  const clienteIdParam = searchParams.get("clienteId") ?? undefined;
  const roleParam = (searchParams.get("role") ?? "").toUpperCase();
  const role = useMemo<UserRole>(() => {
    if (roleParam === UserRole.COMPRADOR) return UserRole.COMPRADOR;
    if (roleParam === UserRole.FORNECEDOR) return UserRole.FORNECEDOR;
    return UserRole.VENDEDOR;
  }, [roleParam]);
  const isCompradorFlow = role === UserRole.COMPRADOR && !!clienteIdParam;

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const name = useWatch({ control, name: "name", defaultValue: "" });
  const email = useWatch({ control, name: "email", defaultValue: "" });
  const emailConfirmation = useWatch({ control, name: "emailConfirmation", defaultValue: "" });
  const password = useWatch({ control, name: "password", defaultValue: "" });
  const passwordConfirmation = useWatch({ control, name: "passwordConfirmation", defaultValue: "" });

  useEffect(() => {
    if (passwordConfirmation) {
      trigger("passwordConfirmation");
    }
  }, [password, passwordConfirmation, trigger]);

  useEffect(() => {
    if (mutationError) {
      showToast({
        type: "error",
        title: "Erro ao criar conta",
        description: mutationError.message || "Erro ao criar conta. Tente novamente.",
      });
    }
  }, [mutationError]);

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    emailConfirmation.trim() !== "" &&
    password.trim() !== "" &&
    passwordConfirmation.trim() !== "" &&
    Object.keys(errors).length === 0 &&
    acceptedTerms;

  const onSubmit = (data: SignupFormData) => {
    signup(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        role,
        clienteId: clienteIdParam,
      },
      {
        onSuccess: (response) => {
          showToast({
            type: "success",
            title: "Conta criada!",
            description:
              response.message ||
              "Verifique seu email para ativar sua conta.",
          });

          onTransition?.();
          router.push(
            `/verifique-seu-email/${encodeURIComponent(response.email ?? data.email)}`,
          );
        },
      },
    );
  };

  return (
    <form
      data-testid="signup-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3.5"
    >
      {isCompradorFlow && (
        <div
          data-testid="signup-comprador-banner"
          className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs"
        >
          <p className="text-foreground">
            Vamos vincular essa conta ao seu pedido pra você acompanhar entregas
            e comprar de novo sem refazer cadastro.
          </p>
        </div>
      )}

      <div data-testid="signup-section-info-header" className="mb-4">
        <h2
          data-testid="signup-section-info-title"
          className="text-md text-foreground font-bold"
        >
          Informações
        </h2>
      </div>

      <div data-testid="signup-field-name" className="space-y-1.5">
        <div data-testid="signup-field-name-wrapper" className="relative">
          <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            data-testid="signup-input-name"
            id="name"
            type="text"
            placeholder="Nome Completo"
            {...register("name")}
            disabled={isPending}
            className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
              errors.name
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
        </div>
        {errors.name && (
          <p data-testid="signup-error-name" className="text-xs text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div data-testid="signup-field-email" className="space-y-1.5">
        <div data-testid="signup-field-email-wrapper" className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            data-testid="signup-input-email"
            id="email"
            type="email"
            placeholder="E-mail"
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
          <p data-testid="signup-error-email" className="text-xs text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div data-testid="signup-field-email-confirmation" className="space-y-1.5">
        <div
          data-testid="signup-field-email-confirmation-wrapper"
          className="relative"
        >
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            data-testid="signup-input-email-confirmation"
            id="emailConfirmation"
            type="email"
            placeholder="Confirme seu e-mail"
            {...register("emailConfirmation")}
            disabled={isPending}
            className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
              errors.emailConfirmation
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
        </div>
        {errors.emailConfirmation && (
          <p
            data-testid="signup-error-email-confirmation"
            className="text-xs text-red-500"
          >
            {errors.emailConfirmation.message}
          </p>
        )}
      </div>

      <div data-testid="signup-section-password-header" className="mt-6 mb-2">
        <h2
          data-testid="signup-section-password-title"
          className="text-md text-foreground flex items-center justify-between font-bold"
        >
          Senha
          <button
            data-testid="signup-button-toggle-password-visibility"
            type="button"
            onClick={() => {
              setShowPassword(!showPassword);
              setShowConfirmPassword(!showConfirmPassword);
            }}
            className="text-foreground hover:text-muted-foreground flex items-center gap-1.5 text-xs transition-colors"
          >
            {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {showPassword ? "Ocultar senha" : "Mostrar senha"}
          </button>
        </h2>
      </div>

      <div data-testid="signup-field-password" className="space-y-1.5">
        <div data-testid="signup-field-password-wrapper" className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            data-testid="signup-input-password"
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            {...register("password")}
            disabled={isPending}
            className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
              errors.password
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
        </div>
      </div>

      <div data-testid="signup-field-password-confirmation" className="space-y-1.5">
        <div
          data-testid="signup-field-password-confirmation-wrapper"
          className="relative"
        >
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            data-testid="signup-input-password-confirmation"
            id="passwordConfirmation"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar senha"
            {...register("passwordConfirmation")}
            disabled={isPending}
            className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
              errors.passwordConfirmation
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
        </div>
        {errors.passwordConfirmation && (
          <p
            data-testid="signup-error-password-confirmation"
            className="text-xs text-red-500"
          >
            {errors.passwordConfirmation.message}
          </p>
        )}
      </div>

      {password && <PasswordStrength password={password} />}

      <div
        data-testid="signup-terms-wrapper"
        className="flex items-start gap-3 pt-2"
      >
        <Switch
          data-testid="signup-switch-accept-terms"
          checked={acceptedTerms}
          onCheckedChange={setAcceptedTerms}
          className="data-[state=unchecked]:bg-muted-foreground mt-0.5 data-[state=checked]:bg-green-500"
        />
        <p
          data-testid="signup-terms-text"
          className="text-muted-foreground text-xs leading-relaxed"
        >
          Confirmo que tenho +18 anos e aceito os{" "}
          <Link
            data-testid="signup-link-terms"
            href="/termos"
            className="text-foreground hover:text-muted-foreground underline"
          >
            Termos e Condições
          </Link>
          ,{" "}
          <Link
            data-testid="signup-link-privacy"
            href="/privacidade"
            className="text-foreground hover:text-muted-foreground underline"
          >
            Política de Privacidade.
          </Link>
        </p>
      </div>

      <div data-testid="signup-submit-wrapper" className="pt-4">
        <Button
          data-testid="signup-button-submit"
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full"
          disabled={!isFormValid || isPending}
        >
          {isPending ? (
            <div
              data-testid="signup-button-submit-loading"
              className="flex items-center gap-2"
            >
              <div
                data-testid="signup-button-submit-spinner"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Criando conta...
            </div>
          ) : (
            "Criar conta"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SignUp;
