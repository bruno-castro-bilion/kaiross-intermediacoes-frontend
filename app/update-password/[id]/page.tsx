"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useState, useEffect } from "react";
import BackgroundEffects from "@/components/background-effects";
import AuthFooter from "@/components/auth-footer";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import PasswordStrength from "@/components/password-strength";
import { Button } from "@/components/ui/button";
import { updatePasswordSchema, type UpdatePasswordData } from "@/lib/schemas/auth";
import { useUpdatePassword } from "@/app/api/auth/mutations";
import { showToast } from "@/components/custom-toast";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UpdatePasswordPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const token = decodeURIComponent(resolvedParams.id);

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const passwordConfirmation = watch("passwordConfirmation", "");

  const isFormValid =
    password.trim() !== "" &&
    passwordConfirmation.trim() !== "" &&
    Object.keys(errors).length === 0;

  useEffect(() => {
    if (passwordConfirmation) {
      trigger("passwordConfirmation");
    }
  }, [password, passwordConfirmation, trigger]);

  const { mutate: resetPassWord, isPending } = useUpdatePassword();

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    resetPassWord(
      { password, token },
      {
        onSuccess: () => {
          router.push("/update-password-success");
        },
        onError: (error) => {
          showToast({
            type: "error",
            title: "Erro ao enviar nova senha",
            description: error.message || "Erro ao atualizar senha.",
          });
        },
      },
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        data-testid="update-password-page"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      >
        <BackgroundEffects />

        <div
          data-testid="update-password-page-content"
          className="relative z-10 flex w-full flex-col items-center justify-center"
        >
          <div
            data-testid="update-password-page-card-wrapper"
            className="w-full max-w-md"
          >
            <div
              data-testid="update-password-page-card-animated"
              className="animate-fade-in-up opacity-0"
              style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
            >
              <div
                data-testid="update-password-page-card"
                className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
              >
                <div
                  data-testid="update-password-page-card-body"
                  className="relative p-8"
                >
                  <div
                    data-testid="update-password-page-logo-wrapper"
                    className="mb-6 flex justify-center"
                  >
                    <Image
                      data-testid="update-password-page-logo"
                      src="/LOGO-MENU.png"
                      alt="Kaiross"
                      width={120}
                      height={40}
                      className="h-auto"
                      priority
                    />
                  </div>

                  <h1
                    data-testid="update-password-page-title"
                    className="text-foreground mb-2 text-center text-xl font-semibold"
                  >
                    Crie uma nova senha!
                  </h1>

                  <div
                    data-testid="update-password-section-info-header"
                    className="mt-6 mb-4 flex items-center justify-between"
                  >
                    <h2
                      data-testid="update-password-section-info-title"
                      className="text-md text-foreground font-bold"
                    >
                      Informações
                    </h2>
                    <button
                      data-testid="update-password-button-toggle-password-visibility"
                      type="button"
                      onClick={() => {
                        setShowPassword(!showPassword);
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
                    >
                      {showPassword ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                      {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </button>
                  </div>

                  <form
                    data-testid="update-password-form"
                    onSubmit={handleSubmitForm}
                    className="space-y-4"
                  >
                    <div
                      data-testid="update-password-field-password"
                      className="space-y-1.5"
                    >
                      <div
                        data-testid="update-password-field-password-wrapper"
                        className="relative"
                      >
                        <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                          data-testid="update-password-input-password"
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nova senha"
                          value={password}
                          {...register("password")}
                          className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
                            errors.password
                              ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                              : "border-border focus-visible:ring-ring focus-visible:ring-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div
                      data-testid="update-password-field-password-confirmation"
                      className="space-y-1.5"
                    >
                      <div
                        data-testid="update-password-field-password-confirmation-wrapper"
                        className="relative"
                      >
                        <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                          data-testid="update-password-input-password-confirmation"
                          id="passwordConfirmation"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmar nova senha"
                          {...register("passwordConfirmation")}
                          className={`bg-input text-foreground placeholder:text-muted-foreground pl-9 ${
                            errors.passwordConfirmation
                              ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                              : "border-border focus-visible:ring-ring focus-visible:ring-1"
                          }`}
                        />
                      </div>
                      {errors.passwordConfirmation && (
                        <div
                          data-testid="update-password-error-password-confirmation"
                          className="animate-in fade-in slide-in-from-top-1 flex items-center gap-1.5 text-red-500"
                        >
                          <AlertCircle size={14} fill="currentColor" />
                          <p
                            data-testid="update-password-error-password-confirmation-message"
                            className="text-xs font-medium"
                          >
                            {errors.passwordConfirmation.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <PasswordStrength password={password} />

                    <Button
                      data-testid="update-password-button-submit"
                      type="submit"
                      disabled={!isFormValid || isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full"
                    >
                      {isPending ? (
                        <div
                          data-testid="update-password-button-submit-loading"
                          className="flex items-center gap-2"
                        >
                          <div
                            data-testid="update-password-button-submit-spinner"
                            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                          />
                          Enviando...
                        </div>
                      ) : (
                        "Redefinir senha"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div
            data-testid="update-password-page-footer-wrapper"
            className="mt-6 w-full max-w-md"
          >
            <AuthFooter actionText="Criar conta" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdatePasswordPage;
