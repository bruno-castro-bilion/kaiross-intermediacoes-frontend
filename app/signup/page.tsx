"use client";

import { Suspense, useState } from "react";
import SignupForm from "@/components/signup-form";
import BackgroundEffects from "@/components/background-effects";
import AuthFooter from "@/components/auth-footer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const SignupPage = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          data-testid="signup-page"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative flex min-h-screen w-full flex-col items-center px-4 py-8 sm:justify-center sm:py-0"
        >
          <BackgroundEffects />

          <div
            data-testid="signup-page-content"
            className="relative z-10 flex w-full flex-col items-center justify-center"
          >
            <div data-testid="signup-page-card-wrapper" className="w-full max-w-md">
              <div
                data-testid="signup-page-card-animated"
                className="animate-fade-in-up opacity-0"
                style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
              >
                <div
                  data-testid="signup-page-card"
                  className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
                >
                  <div
                    data-testid="signup-page-card-body"
                    className="relative p-6"
                  >
                    <div
                      data-testid="signup-page-logo-wrapper"
                      className="mb-6 flex justify-center"
                    >
                      <Image
                        data-testid="signup-page-logo"
                        src="/LOGO-MENU.png"
                        alt="Kaiross"
                        width={140}
                        height={48}
                        className="h-auto"
                        priority
                      />
                    </div>

                    <h1
                      data-testid="signup-page-title"
                      className="text-foreground mb-2 text-center text-xl font-semibold"
                    >
                      Crie sua conta
                    </h1>

                    <p
                      data-testid="signup-page-login-prompt"
                      className="text-muted-foreground mb-6 text-center text-sm"
                    >
                      Já tem uma conta?{" "}
                      <Link
                        data-testid="signup-page-link-login"
                        href="/login"
                        className="text-foreground font-medium hover:underline"
                      >
                        Entrar na sua conta
                      </Link>
                    </p>

                    <Suspense fallback={null}>
                      <SignupForm onTransition={() => setIsVisible(false)} />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-testid="signup-page-footer-wrapper"
              className="mt-6 w-full max-w-md"
            >
              <AuthFooter actionText="Criar conta" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupPage;
