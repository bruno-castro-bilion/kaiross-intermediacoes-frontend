"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useResetPassword } from "@/app/api/auth/mutations";
import { showToast } from "./custom-toast";

interface ResetFormProps {
  onTransition?: () => void;
}

const ResetForm = ({ onTransition }: ResetFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [enable, setEnable] = useState(false);
  const [touched, setTouched] = useState(false);

  const { mutate: resetPassWord, isPending } = useResetPassword();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    resetPassWord(
      { email },
      {
        onSuccess: () => {
          onTransition?.();
          router.push(`/reset-password-success/${encodeURIComponent(email)}`);
        },
        onError: (error) => {
          showToast({
            type: "error",
            title: "Falha na recuperação",
            description: error.message || "Erro ao enviar e-mail de redefinição de senha.",
          });
        },
      },
    );
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEnable(value.trim().length > 0);
    if (value.length > 0) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const isError = touched && email.length <= 0;

  return (
    <form
      data-testid="reset-password-form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div data-testid="reset-password-field-email" className="space-y-1.5">
        <div
          data-testid="reset-password-field-email-wrapper"
          className="relative"
        >
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            data-testid="reset-password-input-email"
            id="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 transition-colors ${
              isError
                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "border-border focus-visible:ring-ring focus-visible:ring-1"
            }`}
          />
        </div>

        {isError && (
          <p
            data-testid="reset-password-error-email"
            className="animate-in fade-in slide-in-from-top-1 text-xs text-red-500"
          >
            E-mail obrigatório
          </p>
        )}
      </div>

      <div data-testid="reset-password-submit-wrapper" className="pt-4">
        <Button
          data-testid="reset-password-button-submit"
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
          disabled={isPending || !enable}
        >
          {isPending ? (
            <div
              data-testid="reset-password-button-submit-loading"
              className="flex items-center gap-2"
            >
              <div
                data-testid="reset-password-button-submit-spinner"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Enviando...
            </div>
          ) : (
            "Enviar link de recuperação"
          )}
        </Button>
      </div>

      <div data-testid="reset-password-signup-wrapper" className="pt-1">
        <p
          data-testid="reset-password-signup-prompt"
          className="text-muted-foreground text-center text-sm"
        >
          Ainda não tem conta?{" "}
          <Link
            data-testid="reset-password-link-signup"
            href="/signup"
            className="text-foreground text-xs transition-colors hover:underline"
          >
            Cadastre-se agora!
          </Link>
        </p>
      </div>
    </form>
  );
};

export default ResetForm;
