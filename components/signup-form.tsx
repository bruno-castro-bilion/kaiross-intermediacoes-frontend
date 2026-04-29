"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/schemas/auth";
import { useSignup } from "@/app/api/auth/mutations";
import { showToast } from "@/components/custom-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  const redirectTo = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { mutate: signup, isPending, error: mutationError } = useSignup();

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
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          if ("error" in response) {
            showToast({
              type: "error",
              title: "Erro ao criar conta",
              description: response.error as string,
            });
            return;
          }

          showToast({
            type: "success",
            title: "Conta criada com sucesso!",
            description: "Bem vindo à Kaiross.",
          });

          onTransition?.();
          router.push(redirectTo || "/dashboard");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <div className="mb-4">
        <h2 className="text-md text-foreground font-bold">Informações</h2>
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
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
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
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
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
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
          <p className="text-xs text-red-500">{errors.emailConfirmation.message}</p>
        )}
      </div>

      <div className="mt-6 mb-2">
        <h2 className="text-md text-foreground flex items-center justify-between font-bold">
          Senha
          <button
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

      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
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

      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
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
          <p className="text-xs text-red-500">{errors.passwordConfirmation.message}</p>
        )}
      </div>

      {password && <PasswordStrength password={password} />}

      <div className="flex items-start gap-3 pt-2">
        <Switch
          checked={acceptedTerms}
          onCheckedChange={setAcceptedTerms}
          className="data-[state=unchecked]:bg-muted-foreground mt-0.5 data-[state=checked]:bg-green-500"
        />
        <p className="text-muted-foreground text-xs leading-relaxed">
          Confirmo que tenho +18 anos e aceito os{" "}
          <Link href="/termos" className="text-foreground hover:text-muted-foreground underline">
            Termos e Condições
          </Link>
          ,{" "}
          <Link href="/privacidade" className="text-foreground hover:text-muted-foreground underline">
            Política de Privacidade.
          </Link>
        </p>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full"
          disabled={!isFormValid || isPending}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
