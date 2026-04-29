"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { KeyRound, TriangleAlert } from "lucide-react";
import CustomModalForm from "../custom-form-modal";
import { settingsEmailSchema } from "@/lib/schemas/settings";
import { updatePasswordSchema } from "@/lib/schemas/auth";
import { z } from "zod";
import { User } from "@/app/api/auth/types";
import { useUpdateUser, useDeleteUser } from "@/app/api/users/mutations";

export default function ManageAccountCard({ user: propUser }: { user?: User }) {
  const storeUser = useAuthStore((s) => s.user);
  const user = propUser ?? storeUser;
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  return (
    <div className="border-border bg-card w-full rounded-lg border p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-md text-foreground mb-4 font-semibold">
            Gerenciar conta
          </h2>

          <div className="text-muted-foreground flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground">Endereço de e-mail:</span>
              <span className="text-muted-foreground font-semibold break-all">
                {user?.email || "usuario@exemplo.com"}
              </span>
              {!user?.email && (
                <Badge className="bg-primary/20 text-primary shrink-0 rounded-md">
                  Pendente
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground">
              Aprimore a segurança da sua conta verificando seu endereço de
              e-mail
            </p>

            <div className="text-left">
              <CustomModalForm
                iconType="emailEdit"
                trigger={
                  <Button variant="link" className="text-primary p-2">
                    Alterar email
                  </Button>
                }
                title={"Alteração de e-mail"}
                schema={settingsEmailSchema}
                inputs={[
                  {
                    name: "email",
                    label: "E-mail",
                    inputType: "email",
                    placeholder: "Seu e-mail",
                  },
                  {
                    name: "emailConfirmation",
                    label: "Confirme seu e-mail",
                    inputType: "email",
                    placeholder: "Confirme seu e-mail",
                  },
                ]}
                submitButton={{
                  buttonType: "submit",
                  label: "Alterar e-mail",
                  variant: "default",
                }}
                cancelButton={{
                  buttonType: "cancel",
                  label: "Cancelar",
                  variant: "outline",
                }}
                isPending={updateUser.status === "pending"}
                onSubmit={async (values) => {
                  if (!user?.id) throw new Error("Usuário não identificado.");

                  const v = values as Record<string, string | undefined>;
                  const data: Partial<User> = { email: v.email || undefined };

                  await updateUser.mutateAsync({ id: user.id, data });
                }}
              />
            </div>
          </div>
        </section>

        <hr className="border-neutral-800" />

        <section>
          <h3 className="text-md text-foreground mb-2 font-semibold">
            Alterar senha
          </h3>
          <p className="text-muted-foreground">
            Aqui você pode alterar a senha de acesso à sua conta.
          </p>
          <div className="mt-3">
            <CustomModalForm
              iconType="passwordEdit"
              trigger={
                <Button variant="outline">
                  <KeyRound className="mr-2 h-4 w-4" /> Alterar senha
                </Button>
              }
              title="Alterar senha"
              schema={updatePasswordSchema}
              passwordStrength={true}
              inputs={[]}
              submitButton={{
                buttonType: "submit",
                label: "Alterar senha",
                variant: "default",
              }}
              cancelButton={{
                buttonType: "cancel",
                label: "Cancelar",
                variant: "outline",
              }}
              isPending={updateUser.status === "pending"}
              onSubmit={async (values) => {
                if (!user?.id) throw new Error("Usuário não identificado.");

                const v = values as Record<string, string | undefined>;
                const data: Record<string, unknown> = {
                  senha: v.password || undefined,
                };

                await updateUser.mutateAsync({
                  id: user.id,
                  data: data as Partial<User>,
                });
              }}
            />
          </div>
        </section>

        <hr className="border-neutral-800" />

        <section>
          <h3 className="text-md text-foregroundmb-2 font-semibold">
            Exclusão de Conta e Informações Pessoais
          </h3>
          <p className="text-muted-foreground pt-1 text-sm">
            A exclusão da sua conta e de todos os dados pessoais é permanente.
            Você não poderá acessar sua conta, negociar ou utilizar nenhum dos
            nossos serviços.
          </p>

          <div className="mt-4">
            <div className="bg-primary/10 text-primary flex items-center gap-3 rounded-md p-3 text-sm">
              <TriangleAlert className="h-4 w-4" />
              <span>
                Não recomendamos encerrar a sua conta pois não há nenhum custo
                para manter o cadastro ativo na Kaiross.
              </span>
            </div>
            <div className="mt-3 text-sm">
              <CustomModalForm
                iconType="error"
                isAccountRemove={true}
                trigger={
                  <Button variant="link" className="p-0 text-xs text-red-500">
                    Solicitar encerramento da conta
                  </Button>
                }
                title="Encerrar conta"
                description={
                  "Cuidado você está encerrando sua conta permanentemente, essa ação é irreversível"
                }
                schema={z.object({
                  confirmText: z
                    .string()
                    .min(1, "Informe o texto para confirmar")
                    .refine((v) => v === "Encerrar conta", {
                      message: "Texto não confere",
                    }),
                })}
                inputs={[]}
                submitButton={{
                  buttonType: "submit",
                  label: "Encerrar conta",
                  variant: "default",
                }}
                cancelButton={{
                  buttonType: "cancel",
                  label: "Cancelar",
                  variant: "outline",
                }}
                isPending={deleteUser.status === "pending"}
                onSubmit={async () => {
                  if (!user?.id) throw new Error("Usuário não identificado.");

                  try {
                    await deleteUser.mutateAsync(user.id);
                  } catch (err) {
                    console.error("Erro ao encerrar conta", err);
                    throw err;
                  }
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
