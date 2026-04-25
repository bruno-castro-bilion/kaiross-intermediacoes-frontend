"use client";

import { Suspense, useState } from "react";
import LoginForm from "@/components/login-form";
import BackgroundEffects from "@/components/background-effects";
import AuthFooter from "@/components/auth-footer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const LoginPage = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative flex min-h-screen w-full flex-col items-center px-4 py-8 sm:justify-center sm:py-0"
        >
          <BackgroundEffects />

          <div className="relative z-10 flex w-full flex-col items-center justify-center">
            <div className="w-full max-w-md">
              <div
                className="animate-fade-in-up opacity-0"
                style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
              >
                <div className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
                  <div className="relative p-6">
                    <div className="mb-6 flex justify-center">
                      <Image
                        src="/LOGO-MENU.png"
                        alt="Kaiross"
                        width={140}
                        height={48}
                        className="h-auto"
                        priority
                      />
                    </div>

                    <h1 className="text-foreground mb-6 text-center text-xl font-semibold">
                      Bem vindo de volta
                    </h1>

                    <Suspense fallback={null}>
                      <LoginForm onTransition={() => setIsVisible(false)} />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 w-full max-w-md">
              <AuthFooter actionText="Iniciar sessão" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPage;
