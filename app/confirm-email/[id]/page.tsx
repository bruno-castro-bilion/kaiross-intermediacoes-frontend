"use client";

import { use, useEffect, useRef, useState } from "react";
import BackgroundEffects from "@/components/background-effects";
import { motion, AnimatePresence } from "framer-motion";
import AuthFooter from "@/components/auth-footer";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmEmail } from "@/app/api/auth/mutations";

interface PageProps {
  params: Promise<{ id: string }>;
}

type Status = "pending" | "success" | "error";

const ConfirmEmailPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const token = decodeURIComponent(resolvedParams.id);

  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const triggered = useRef(false);

  const { mutate: confirm } = useConfirmEmail();

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    confirm(
      { token },
      {
        onSuccess: () => setStatus("success"),
        onError: (error) => {
          setStatus("error");
          setErrorMessage(
            error.message ||
              "Não foi possível confirmar seu email. O link pode ter expirado.",
          );
        },
      },
    );
  }, [token, confirm]);

  return (
    <AnimatePresence>
      <motion.div
        data-testid="confirm-email-page"
        data-status={status}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      >
        <BackgroundEffects />

        <div
          data-testid="confirm-email-page-content"
          className="relative z-10 flex w-full flex-col items-center justify-center"
        >
          <div
            data-testid="confirm-email-page-card-wrapper"
            className="w-full max-w-md"
          >
            <div
              data-testid="confirm-email-page-card-animated"
              className="animate-fade-in-up w-full opacity-0"
              style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
            >
              <div
                data-testid="confirm-email-page-card"
                className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
              >
                <div
                  data-testid="confirm-email-page-card-body"
                  className="flex flex-col items-center p-8 text-center"
                >
                  <div
                    data-testid="confirm-email-page-logo-wrapper"
                    className="mb-4 flex justify-center"
                  >
                    <Image
                      data-testid="confirm-email-page-logo"
                      src="/LOGO-MENU.png"
                      alt="Kaiross"
                      width={120}
                      height={40}
                      className="h-auto"
                      priority
                    />
                  </div>

                  {status === "pending" && (
                    <>
                      <div
                        data-testid="confirm-email-page-icon-wrapper-pending"
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
                      >
                        <Loader2
                          data-testid="confirm-email-page-icon-pending"
                          className="h-8 w-8 animate-spin text-blue-500"
                        />
                      </div>
                      <h1
                        data-testid="confirm-email-page-title-pending"
                        className="text-foreground mb-2 text-xl font-semibold"
                      >
                        Confirmando seu email...
                      </h1>
                      <p
                        data-testid="confirm-email-page-description-pending"
                        className="text-muted-foreground text-sm"
                      >
                        Isso leva apenas um instante.
                      </p>
                    </>
                  )}

                  {status === "success" && (
                    <>
                      <div
                        data-testid="confirm-email-page-icon-wrapper-success"
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                      >
                        <CheckCircle2
                          data-testid="confirm-email-page-icon-success"
                          className="h-8 w-8 text-green-500"
                        />
                      </div>
                      <h1
                        data-testid="confirm-email-page-title-success"
                        className="text-foreground mb-2 text-xl font-semibold"
                      >
                        Email confirmado!
                      </h1>
                      <p
                        data-testid="confirm-email-page-description-success"
                        className="text-muted-foreground mb-6 text-sm"
                      >
                        Sua conta foi ativada. Faça login para começar.
                      </p>
                      <Button
                        data-testid="confirm-email-page-button-go-to-login"
                        asChild
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                      >
                        <Link href="/login">Ir para o Login</Link>
                      </Button>
                    </>
                  )}

                  {status === "error" && (
                    <>
                      <div
                        data-testid="confirm-email-page-icon-wrapper-error"
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
                      >
                        <XCircle
                          data-testid="confirm-email-page-icon-error"
                          className="h-8 w-8 text-red-500"
                        />
                      </div>
                      <h1
                        data-testid="confirm-email-page-title-error"
                        className="text-foreground mb-2 text-xl font-semibold"
                      >
                        Não foi possível confirmar
                      </h1>
                      <p
                        data-testid="confirm-email-page-description-error"
                        className="text-muted-foreground mb-6 text-sm"
                      >
                        {errorMessage}
                      </p>
                      <div
                        data-testid="confirm-email-page-actions-error"
                        className="flex w-full flex-col gap-2"
                      >
                        <Button
                          data-testid="confirm-email-page-button-try-login"
                          asChild
                          variant="outline"
                          className="w-full"
                        >
                          <Link href="/login">Tentar fazer login</Link>
                        </Button>
                        <Button
                          data-testid="confirm-email-page-button-create-account"
                          asChild
                          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                        >
                          <Link href="/signup">Criar conta novamente</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            data-testid="confirm-email-page-footer-wrapper"
            className="mt-6 w-full max-w-md"
          >
            <AuthFooter actionText="Iniciar sessão" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmEmailPage;
