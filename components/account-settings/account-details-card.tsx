"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import CustomModalForm from "../custom-form-modal";
import { personalInfoSchema, addressSchema } from "@/lib/schemas/settings";
import { User, UserProfile } from "@/app/api/auth/types";
import { onlyDigits } from "@/lib/validators/identification";
import { formatCPF, formatCNPJ } from "@brazilian-utils/brazilian-utils";
import { useUpdateUser } from "@/app/api/users/mutations";
import {
  useCreateAddress,
  useUpdateAddress,
} from "@/app/api/users/address/mutations";
import { useGetAddressByUserId } from "@/app/api/users/address/queries";
import type { Address } from "@/app/api/users/address/types";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { useGetUserById } from "@/app/api/users/queries";
import { countries, getCountryNameByDialCode } from "@/lib/countries";

function resolveCountryDisplay(codigoPais?: string | null) {
  if (!codigoPais) return "";
  const s = String(codigoPais).trim();

  if (/^[A-Za-z]{2}$/.test(s)) {
    const countryByCode = countries.find(
      (c) => c.code.toLowerCase() === s.toLowerCase(),
    );
    return countryByCode?.name || s;
  }

  if (/^\+?\d+$/.test(s)) {
    return getCountryNameByDialCode(s);
  }

  return s;
}

export default function AccountDetailsCard({
  user: propUser,
}: {
  user?: User;
}) {
  const storeUser = useAuthStore((s) => s.user);
  const userId = storeUser?.id ?? propUser?.id;
  const updateUser = useUpdateUser();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const addressQuery = useGetAddressByUserId(userId);
  const userQuery = useGetUserById(userId);
  const userData = userQuery.data;
  const addressData = addressQuery.data;
  const formatPhoneDisplay = (
    codigoPais?: string | null,
    ddd?: string | null,
    numero?: string | null,
  ) => {
    const only = (s?: string | null) => (s ? String(s).replace(/\D/g, "") : "");
    const cp = only(codigoPais);
    const d = only(ddd);
    const n = only(numero) || only(userData?.phone);
    if (!n) return null;
    const parts: string[] = [];
    if (cp) parts.push(`+${cp}`);
    if (d) parts.push(`(${d})`);
    if (n) {
      const formattedNumber =
        n.length > 4 ? `${n.slice(0, n.length - 4)}-${n.slice(-4)}` : n;
      parts.push(formattedNumber);
    }
    return parts.join(" ");
  };

  const phoneDisplay = formatPhoneDisplay(
    userData?.codigoPais,
    userData?.ddd,
    userData?.numeroTelefone,
  );

  return (
    <div
      data-testid="account-details-card"
      data-loading={userQuery.isLoading ? "true" : "false"}
      className="border-border bg-card w-full rounded-lg border p-4 md:p-6"
    >
      {userQuery.isLoading ? (
        <div
          data-testid="account-details-card-loading"
          className="flex flex-col gap-6"
        >
          <section data-testid="account-details-card-loading-personal">
            <h2 className="text-foreground text-md mb-4 font-semibold">
              Informações pessoais
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section data-testid="account-details-card-loading-address">
            <h2 className="text-md text-foreground mb-4 font-semibold">
              Endereço
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div
          data-testid="account-details-card-body"
          className="flex flex-col gap-6"
        >
          <section data-testid="account-details-card-section-personal">
            <h2
              data-testid="account-details-card-section-personal-title"
              className="text-foreground text-md mb-4 font-semibold"
            >
              Informações pessoais
            </h2>

            <div
              data-testid="account-details-card-personal-fields"
              className="text-muted-foreground flex flex-col gap-2 text-sm"
            >
              <div
                data-testid="account-details-card-field-name"
                className="flex flex-wrap items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-name-label"
                  className="text-muted-foreground"
                >
                  Nome:
                </span>
                <span
                  data-testid="account-details-card-field-name-value"
                  className="text-foreground"
                >
                  {userData?.nomeCompleto ?? userData?.name ?? ""}
                </span>
                {!(userData?.nomeCompleto || userData?.name) && (
                  <Badge
                    data-testid="account-details-card-field-name-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>

              <div
                data-testid="account-details-card-field-document"
                className="flex flex-wrap items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-document-label"
                  className="text-muted-foreground"
                >
                  CPF/CNPJ:
                </span>
                {userData?.documento ? (
                  <span
                    data-testid="account-details-card-field-document-value"
                    className="text-foreground"
                  >
                    {(() => {
                      const raw = String(userData.documento || "").replace(
                        /\D/g,
                        "",
                      );
                      if (!raw) return "";
                      return raw.length <= 11
                        ? formatCPF(raw)
                        : formatCNPJ(raw);
                    })()}
                  </span>
                ) : (
                  <Badge
                    data-testid="account-details-card-field-document-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>

              <div
                data-testid="account-details-card-field-phone"
                className="flex flex-wrap items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-phone-label"
                  className="text-muted-foreground"
                >
                  Telefone/Celular:
                </span>
                {phoneDisplay ? (
                  <span
                    data-testid="account-details-card-field-phone-value"
                    className="text-foreground"
                  >
                    {phoneDisplay}
                  </span>
                ) : (
                  <>
                    <span
                      data-testid="account-details-card-field-phone-empty"
                      className="text-foreground"
                    >
                      {""}
                    </span>
                    <Badge
                      data-testid="account-details-card-field-phone-pending"
                      className="bg-primary/20 text-primary shrink-0 rounded-md"
                    >
                      Pendente
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div
              data-testid="account-details-card-personal-actions"
              className="mt-4"
            >
              <CustomModalForm
                testId="account-details-personal-modal"
                iconType="userInfoEdit"
                trigger={
                  <Button
                    data-testid="account-details-card-button-edit-personal"
                    variant="link"
                    className="text-primary p-0"
                  >
                    Editar informações pessoais
                  </Button>
                }
                title="Informações pessoais"
                schema={personalInfoSchema}
                inputs={[
                  { name: "name", label: "Nome", inputType: "text" },
                  { name: "document", label: "CPF / CNPJ", inputType: "cpf" },
                  { name: "phone", label: "Telefone", inputType: "phone" },
                ]}
                defaultValues={{
                  name: userData?.nomeCompleto ?? userData?.name ?? "",
                  document:
                    (userData as UserProfile | undefined)?.document ??
                    userData?.documento ??
                    "",
                  codigoPais: userData?.codigoPais ?? "",
                  phone: `${userData?.ddd ?? ""}${userData?.numeroTelefone ?? userData?.phone ?? ""}`,
                }}
                isPending={updateUser.status === "pending"}
                submitButton={{
                  buttonType: "submit",
                  label: "Salvar",
                  loadingLabel: "Salvando...",
                }}
                onSubmit={async (values) => {
                  if (!userId) throw new Error("Usuário não identificado.");

                  const v = values as Record<string, string | undefined>;
                  let phoneDigits = v.phone ? onlyDigits(v.phone) : undefined;
                  if (phoneDigits) {
                    if (phoneDigits.length > 9) {
                      phoneDigits = phoneDigits.slice(-9);
                    }
                  }

                  const data: Partial<User> = {
                    nomeCompleto: v.name || undefined,
                    documento: v.document ? onlyDigits(v.document) : undefined,
                    codigoPais: v.codigoPais || undefined,
                    ddd: v.ddd || undefined,
                    numeroTelefone: phoneDigits || undefined,
                  };

                  const res = await updateUser.mutateAsync({
                    id: String(userId),
                    data,
                  });
                  if (res && typeof res === "object" && "error" in res) {
                    throw new Error(
                      (res as { error?: string }).error ||
                        "Erro ao atualizar usuário.",
                    );
                  }
                }}
              />
            </div>
          </section>

          <hr className="border-border" />

          <section data-testid="account-details-card-section-address">
            <h2
              data-testid="account-details-card-section-address-title"
              className="text-md text-foreground mb-4 font-semibold"
            >
              Endereço
            </h2>

            <div
              data-testid="account-details-card-address-fields"
              className="text-muted-foreground flex flex-col gap-2 text-sm"
            >
              <div
                data-testid="account-details-card-field-cep"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-cep-label"
                  className="text-muted-foreground"
                >
                  Cep:
                </span>
                <span
                  data-testid="account-details-card-field-cep-value"
                  className="text-foreground"
                >
                  {addressData?.cep ?? userData?.cep ?? ""}
                </span>
                {!addressData?.cep && !userData?.cep && (
                  <Badge
                    data-testid="account-details-card-field-cep-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>
              <div
                data-testid="account-details-card-field-country"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-country-label"
                  className="text-muted-foreground"
                >
                  País:
                </span>
                <span
                  data-testid="account-details-card-field-country-value"
                  className="text-foreground"
                >
                  {addressData?.pais ??
                    resolveCountryDisplay(userData?.codigoPais) ??
                    ""}
                </span>
                {!addressData?.pais && !userData?.codigoPais && (
                  <Badge
                    data-testid="account-details-card-field-country-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>

              <div
                data-testid="account-details-card-field-state"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-state-label"
                  className="text-muted-foreground"
                >
                  Estado:
                </span>
                <span
                  data-testid="account-details-card-field-state-value"
                  className="text-foreground"
                >
                  {addressData?.estado ?? userData?.state ?? ""}
                </span>
                {!addressData?.estado && !userData?.state && (
                  <Badge
                    data-testid="account-details-card-field-state-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>

              <div
                data-testid="account-details-card-field-city"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-city-label"
                  className="text-muted-foreground"
                >
                  Cidade:
                </span>
                <span
                  data-testid="account-details-card-field-city-value"
                  className="text-foreground"
                >
                  {addressData?.cidade ?? userData?.city ?? ""}
                </span>
                {!addressData?.cidade && !userData?.city && (
                  <Badge
                    data-testid="account-details-card-field-city-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>

              <div
                data-testid="account-details-card-field-street"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-street-label"
                  className="text-muted-foreground"
                >
                  Endereço:
                </span>
                <span
                  data-testid="account-details-card-field-street-value"
                  className="text-foreground"
                >
                  {addressData?.rua ?? userData?.address ?? ""}
                </span>
                {!addressData?.rua && !userData?.address && (
                  <Badge
                    data-testid="account-details-card-field-street-pending"
                    className="bg-primary/20 text-primary shrink-0 rounded-md"
                  >
                    Pendente
                  </Badge>
                )}
              </div>

              <div
                data-testid="account-details-card-field-number"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-number-label"
                  className="text-muted-foreground"
                >
                  Número:
                </span>
                <span
                  data-testid="account-details-card-field-number-value"
                  className="text-foreground"
                >
                  {addressData?.numero ??
                    (userData as User & { numero?: number })?.numero ??
                    ""}
                </span>
                {!addressData?.numero &&
                  !(userData as User & { numero?: number })?.numero && (
                    <Badge
                      data-testid="account-details-card-field-number-pending"
                      className="bg-primary/20 text-primary shrink-0 rounded-md"
                    >
                      Pendente
                    </Badge>
                  )}
              </div>

              <div
                data-testid="account-details-card-field-neighborhood"
                className="flex items-center gap-3"
              >
                <span
                  data-testid="account-details-card-field-neighborhood-label"
                  className="text-muted-foreground"
                >
                  Bairro:
                </span>
                <span
                  data-testid="account-details-card-field-neighborhood-value"
                  className="text-foreground"
                >
                  {addressData?.bairro ??
                    (userData as User & { bairro?: string })?.bairro ??
                    ""}
                </span>
                {!addressData?.bairro &&
                  !(userData as User & { bairro?: string })?.bairro && (
                    <Badge
                      data-testid="account-details-card-field-neighborhood-pending"
                      className="bg-primary/20 text-primary shrink-0 rounded-md"
                    >
                      Pendente
                    </Badge>
                  )}
              </div>
            </div>

            <div
              data-testid="account-details-card-address-actions"
              className="mt-4"
            >
              <CustomModalForm
                testId="account-details-address-modal"
                iconType="userAddressEdit"
                trigger={
                  <Button
                    data-testid="account-details-card-button-edit-address"
                    variant="link"
                    className="text-primary p-0"
                  >
                    Editar endereço
                  </Button>
                }
                title="Endereço"
                schema={addressSchema}
                inputs={[
                  [
                    { name: "cep", label: "CEP", inputType: "text" },
                    { name: "numero", label: "Número", inputType: "text" },
                  ],
                  { name: "address", label: "Endereço", inputType: "text" },
                  [
                    { name: "bairro", label: "Bairro", inputType: "text" },
                    { name: "city", label: "Cidade", inputType: "text" },
                  ],
                  [
                    { name: "state", label: "Estado", inputType: "text" },
                    { name: "country", label: "País", inputType: "text" },
                  ],
                ]}
                defaultValues={{
                  cep:
                    addressData?.cep !== undefined
                      ? String(addressData.cep)
                      : userData?.cep
                        ? String(userData.cep)
                        : "",
                  address: addressData?.rua ?? userData?.address ?? "",
                  numero:
                    addressData?.numero !== undefined
                      ? String(addressData.numero)
                      : (userData as User & { numero?: number })?.numero
                        ? String(
                            (userData as User & { numero?: number }).numero,
                          )
                        : "",
                  bairro:
                    addressData?.bairro ??
                    (userData as User & { bairro?: string })?.bairro ??
                    "",
                  city: addressData?.cidade ?? userData?.city ?? "",
                  state: addressData?.estado ?? userData?.state ?? "",
                  country:
                    addressData?.pais ??
                    resolveCountryDisplay(userData?.codigoPais) ??
                    "",
                  codigoPais:
                    addressData?.idUsuario?.codigoPais ??
                    userData?.codigoPais ??
                    "",
                }}
                isPending={
                  createAddress.isPending ||
                  updateAddress.isPending ||
                  updateUser.isPending
                }
                submitButton={{
                  buttonType: "submit",
                  label: "Salvar",
                  loadingLabel: "Salvando...",
                }}
                onSubmit={async (values) => {
                  if (!userId) throw new Error("Usuário não identificado.");

                  const v = values as Record<string, string | undefined>;

                  const cepDigits = v.cep ? onlyDigits(v.cep) : undefined;
                  const numeroDigits = v.numero
                    ? onlyDigits(v.numero)
                    : undefined;

                  const addressPayload: Partial<Address> = {
                    cep: cepDigits ? Number(cepDigits) : undefined,
                    rua: v.address || undefined,
                    numero: numeroDigits ? Number(numeroDigits) : undefined,
                    bairro: v.bairro || undefined,
                    cidade: v.city || undefined,
                    estado: v.state || undefined,
                    pais: v.country || undefined,
                  };

                  const currentAddress = addressData;

                  if (!currentAddress) {
                    const res = await createAddress.mutateAsync({
                      id: userId,
                      data: addressPayload,
                    });
                    if (res && typeof res === "object" && "error" in res) {
                      throw new Error(
                        (res as { error?: string }).error ||
                          "Erro ao criar endereço.",
                      );
                    }

                    await addressQuery.refetch();
                  } else {
                    let addressId: string | undefined = (
                      addressData as Address & { id?: string }
                    )?.id;

                    if (!addressId) {
                      try {
                        const lookup = await axios.get(
                          `/api/users/address/user/${userId}`,
                          { withCredentials: true },
                        );
                        const p = lookup.data;
                        if (Array.isArray(p) && p.length > 0) {
                          addressId =
                            p[0]?.id ?? p[0]?.address?.id ?? p[0]?.data?.id;
                        } else if (
                          p &&
                          p.data &&
                          Array.isArray(p.data) &&
                          p.data.length > 0
                        ) {
                          addressId = p.data[0]?.id;
                        } else if (
                          p &&
                          p.address &&
                          Array.isArray(p.address) &&
                          p.address.length > 0
                        ) {
                          addressId = p.address[0]?.id;
                        }
                      } catch (e) {
                        console.warn("Could not lookup address id:", e);
                      }
                    }

                    if (!addressId) {
                      const res = await createAddress.mutateAsync({
                        id: userId,
                        data: addressPayload,
                      });
                      if (res && typeof res === "object" && "error" in res) {
                        throw new Error(
                          (res as { error?: string }).error ||
                            "Erro ao criar endereço.",
                        );
                      }
                      await addressQuery.refetch();
                    } else {
                      const addrRes = await updateAddress.mutateAsync({
                        addressId: String(addressId),
                        data: addressPayload,
                      });
                      if (
                        addrRes &&
                        typeof addrRes === "object" &&
                        "error" in addrRes
                      ) {
                        throw new Error(
                          (addrRes as { error?: string }).error ||
                            "Erro ao atualizar endereço.",
                        );
                      }

                      await addressQuery.refetch();
                    }
                  }
                }}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
