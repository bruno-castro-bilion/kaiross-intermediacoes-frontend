"use client";

import { useState } from "react";
import { Copy, SquarePen, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useAuthStore } from "@/lib/store/auth-store";
import { User } from "@/app/api/auth/types";
import { useUpdateUser } from "@/app/api/users/mutations";
import { showToast } from "@/components/custom-toast";
import { useGetUserById } from "@/app/api/users/queries";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ImageUpload } from "../custom-file-upload";

export default function AccountProfileCard({
  user: propUser,
}: {
  user?: User;
}) {
  const storeUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const user = propUser ?? storeUser;
  const updateUser = useUpdateUser();
  const userQuery = useGetUserById(user?.id);
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatarCacheBust, setAvatarCacheBust] = useState(() =>
    Date.now().toString(),
  );

  const copyId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const registrationDate = (user as User)?.createdAt || "12/02/2025";

  const formattedDate = registrationDate
    ? new Date(registrationDate).toLocaleDateString("pt-BR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const initials =
    (user?.nomeCompleto || user?.name)
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.initials ||
    "US";

  return (
    <div className="border-border bg-card flex w-full flex-col gap-4 self-stretch rounded-lg border p-4 md:p-6">
      {userQuery.isLoading ? (
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary rounded-full p-px">
                <div className="bg-card rounded-full p-1">
                  <Skeleton className="h-20 w-20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <Skeleton className="mb-2 h-8 w-48" />
              <Skeleton className="mt-1 h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary rounded-full p-px">
                <div className="bg-card rounded-full p-1">
                  <Avatar className="size-20">
                    {user?.fotoPerfil || user?.avatar ? (
                      <>
                        <AvatarImage
                          src={`${user.fotoPerfil || user.avatar}?cb=${avatarCacheBust}`}
                          alt={user?.nomeCompleto}
                          key={avatarCacheBust}
                        />
                        <AvatarFallback className="bg-muted animate-pulse">
                          <Skeleton className="h-full w-full rounded-full" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    aria-label="Editar foto"
                    className="bg-muted/60 text-muted-foreground absolute -right-1 -bottom-1 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md shadow-sm"
                  >
                    <SquarePen className="h-4 w-4 cursor-pointer" />
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar foto</DialogTitle>
                  </DialogHeader>

                  <ImageUpload
                    type="avatar"
                    onUpload={async (results) => {
                      const fileUrl = results[0]?.fileUrl;

                      if (!fileUrl) {
                        showToast({
                          type: "error",
                          title: "Erro",
                          description: "Upload falhou. Tente novamente.",
                        });
                        return;
                      }

                      if (!user?.id) {
                        showToast({
                          type: "error",
                          title: "Erro",
                          description: "Usuário não identificado.",
                        });
                        return;
                      }

                      try {
                        await updateUser.mutateAsync({
                          id: user.id,
                          data: { fotoPerfil: fileUrl },
                        });

                        const current = useAuthStore.getState().user;
                        const updatedUser: User = {
                          ...(current as User),
                          fotoPerfil: fileUrl,
                        };

                        setUser(updatedUser);
                        queryClient.setQueryData(
                          ["user", user.id],
                          updatedUser,
                        );
                        setAvatarCacheBust(Date.now().toString());

                        setDialogOpen(false);

                        showToast({
                          type: "success",
                          title: "Sucesso",
                          description: "Foto atualizada com sucesso.",
                        });
                      } catch (e: unknown) {
                        const message =
                          e instanceof Error
                            ? e.message
                            : "Erro ao atualizar foto.";
                        showToast({
                          type: "error",
                          title: "Erro",
                          description: message,
                        });
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col">
              <span className="text-foreground text-2xl font-semibold">
                {user?.nomeCompleto || user?.name || "Usuário"}
              </span>

              <div className="mt-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-foreground max-w-48 truncate text-sm">
                    <span className="text-muted-foreground text-sm">ID:</span>{" "}
                    {user?.id || "—"}
                  </span>
                  <button
                    onClick={copyId}
                    aria-label="Copiar id"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex cursor-pointer items-center justify-center rounded-md p-1 transition-colors"
                  >
                    {copied ? (
                      <Check className="pointer-events-none h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="pointer-events-none h-4 w-4" />
                    )}
                  </button>
                  {copied && (
                    <span className="animate-in fade-in slide-in-from-left-1 text-xs text-green-600 duration-200">
                      Copiado!
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    <span className="text-muted-foreground text-xs">
                      Data de registro: {formattedDate}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
