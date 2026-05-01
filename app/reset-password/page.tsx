"use client";

import { useState } from "react";
import BackgroundEffects from "@/components/background-effects";
import { motion, AnimatePresence } from "framer-motion";
import ResetForm from "@/components/reset-form";
import AuthFooter from "@/components/auth-footer";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const ResetPasswordPage = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          data-testid="reset-password-page"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative flex min-h-screen w-full flex-col items-center px-4 py-8 sm:justify-center sm:py-0"
        >
          <BackgroundEffects />

          <div
            data-testid="reset-password-page-content"
            className="relative z-10 flex w-full flex-col items-center justify-center"
          >
            <div
              data-testid="reset-password-page-card-wrapper"
              className="w-full max-w-md"
            >
              <div
                data-testid="reset-password-page-card-animated"
                className="animate-fade-in-up w-full opacity-0"
                style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
              >
                <div
                  data-testid="reset-password-page-card"
                  className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
                >
                  <div
                    data-testid="reset-password-page-card-body"
                    className="relative p-6"
                  >
                    <div
                      data-testid="reset-password-page-logo-wrapper"
                      className="mb-4 flex justify-center"
                    >
                      <Image
                        data-testid="reset-password-page-logo"
                        src="/LOGO-MENU.png"
                        alt="Kaiross"
                        width={120}
                        height={40}
                        className="h-auto"
                        priority
                      />
                    </div>

                    <p data-testid="reset-password-page-back-wrapper" className="mb-5">
                      <Link
                        data-testid="reset-password-page-link-back-to-login"
                        href="/login"
                        className="text-muted-foreground inline-flex items-center gap-1 text-xs transition-colors hover:underline"
                      >
                        <ChevronLeft size={14} /> Voltar para o login
                      </Link>
                    </p>

                    <h1
                      data-testid="reset-password-page-title"
                      className="text-foreground mb-3 text-xl font-semibold"
                    >
                      Recuperação de senha
                    </h1>

                    <p
                      data-testid="reset-password-page-description"
                      className="text-muted-foreground mb-5 text-sm"
                    >
                      Para começar o processo de alteração de sua senha, digite
                      seu e-mail
                    </p>

                    <ResetForm onTransition={() => setIsVisible(false)} />
                  </div>
                </div>
              </div>
            </div>

            <div
              data-testid="reset-password-page-footer-wrapper"
              className="mt-6 w-full max-w-md"
            >
              <AuthFooter actionText="Iniciar sessão" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordPage;
