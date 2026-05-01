"use client";

import { use } from "react";
import BackgroundEffects from "@/components/background-effects";
import { motion, AnimatePresence } from "framer-motion";
import AuthFooter from "@/components/auth-footer";
import Image from "next/image";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResendConfirmation } from "@/app/api/auth/mutations";
import { showToast } from "@/components/custom-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

const VerifiqueSeuEmailPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const email = decodeURIComponent(resolvedParams.id);

  const { mutate: resend, isPending } = useResendConfirmation();

  const handleResend = () => {
    resend(
      { email },
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
    <AnimatePresence>
      <motion.div
        data-testid="verifique-email-page"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      >
        <BackgroundEffects />

        <div
          data-testid="verifique-email-page-content"
          className="relative z-10 flex w-full flex-col items-center justify-center"
        >
          <div
            data-testid="verifique-email-page-card-wrapper"
            className="w-full max-w-md"
          >
            <div
              data-testid="verifique-email-page-card-animated"
              className="animate-fade-in-up w-full opacity-0"
              style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
            >
              <div
                data-testid="verifique-email-page-card"
                className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
              >
                <div
                  data-testid="verifique-email-page-card-body"
                  className="flex flex-col items-center p-8 text-center"
                >
                  <div
                    data-testid="verifique-email-page-logo-wrapper"
                    className="mb-4 flex justify-center"
                  >
                    <Image
                      data-testid="verifique-email-page-logo"
                      src="/LOGO-MENU.png"
                      alt="Kaiross"
                      width={120}
                      height={40}
                      className="h-auto"
                      priority
                    />
                  </div>

                  <div
                    data-testid="verifique-email-page-icon-wrapper"
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                  >
                    <MailCheck
                      data-testid="verifique-email-page-icon"
                      className="h-8 w-8 text-green-500"
                    />
                  </div>

                  <h1
                    data-testid="verifique-email-page-title"
                    className="text-foreground mb-2 text-xl font-semibold"
                  >
                    Verifique seu email
                  </h1>

                  <p
                    data-testid="verifique-email-page-description"
                    className="text-muted-foreground mb-2 text-sm"
                  >
                    Enviamos um link de confirmação para:
                  </p>

                  <p
                    data-testid="verifique-email-page-email"
                    className="text-foreground mb-4 font-medium"
                  >
                    {email}
                  </p>

                  <p
                    data-testid="verifique-email-page-help"
                    className="text-muted-foreground mb-6 text-xs leading-relaxed"
                  >
                    Clique no link recebido para ativar sua conta. Confira a
                    pasta de spam se não encontrar o email.
                  </p>

                  <div
                    data-testid="verifique-email-page-actions"
                    className="flex w-full flex-col gap-2"
                  >
                    <Button
                      data-testid="verifique-email-page-button-resend"
                      type="button"
                      onClick={handleResend}
                      disabled={isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {isPending ? "Reenviando..." : "Reenviar email"}
                    </Button>

                    <Button
                      data-testid="verifique-email-page-button-back-to-login"
                      asChild
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                    >
                      <Link href="/login">Voltar para o Login</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            data-testid="verifique-email-page-footer-wrapper"
            className="mt-6 w-full max-w-md"
          >
            <AuthFooter actionText="Iniciar sessão" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerifiqueSeuEmailPage;
