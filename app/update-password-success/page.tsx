"use client";

import BackgroundEffects from "@/components/background-effects";
import { motion, AnimatePresence } from "framer-motion";
import AuthFooter from "@/components/auth-footer";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdatePasswordSuccessPage = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      >
        <BackgroundEffects />

        <div className="relative z-10 flex w-full flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <div
              className="animate-fade-in-up w-full opacity-0"
              style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
            >
              <div className="border-border bg-card/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <Image
                      src="/LOGO-MENU.png"
                      alt="Kaiross"
                      width={120}
                      height={40}
                      className="h-auto"
                      priority
                    />
                  </div>

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>

                  <h1 className="text-foreground mb-2 text-xl font-semibold">
                    Sua senha foi redefinida com sucesso!
                  </h1>

                  <p className="text-muted-foreground mb-6 text-sm">
                    Por favor, use sua nova senha para fazer login na sua conta.
                  </p>

                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                    <Link href="/login">Voltar para o Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full max-w-md">
            <AuthFooter actionText="Iniciar sessão" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdatePasswordSuccessPage;
