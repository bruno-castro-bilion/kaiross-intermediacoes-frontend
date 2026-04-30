"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Settings } from "lucide-react";
import AccountProfileCard from "@/components/account-settings/account-profile-card";
import AccountDetailsCard from "@/components/account-settings/account-details-card";
import ManageAccountCard from "@/components/account-settings/manage-account-card";
import { useAuthStore } from "@/lib/store/auth-store";
import { useGetUserById } from "@/app/api/users/queries";

type Tab = "dados-gerais" | "gerenciar-conta";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dados-gerais", label: "Dados gerais", icon: User },
  { id: "gerenciar-conta", label: "Gerenciar conta", icon: Settings },
];

export default function MinhaContaPage() {
  const authUser = useAuthStore((s) => s.user);
  const userId = authUser?.id;
  const { data: fetchedUser } = useGetUserById(userId);
  const [activeTab, setActiveTab] = useState<Tab>("dados-gerais");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto w-full max-w-5xl p-4 pb-8 md:p-6 md:pb-12"
    >
      <h1 className="mb-6 text-lg font-semibold">Minha conta</h1>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-x-4">
        {/* Coluna esquerda — perfil + navegação */}
        <aside className="flex w-full flex-col gap-4 md:w-72 md:shrink-0 lg:w-80">
          <AccountProfileCard user={fetchedUser ?? undefined} />

          {/* Menu de navegação */}
          <div className="border-border bg-card w-full rounded-lg border p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Coluna direita — conteúdo da aba ativa */}
        <main className="min-w-0 flex-1">
          {activeTab === "dados-gerais" ? (
            <AccountDetailsCard user={fetchedUser ?? undefined} />
          ) : (
            <ManageAccountCard user={fetchedUser ?? undefined} />
          )}
        </main>
      </div>
    </motion.div>
  );
}
