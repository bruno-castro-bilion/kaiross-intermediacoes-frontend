"use client";

import { use, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react";

import BackgroundEffects from "@/components/background-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputCpfCnpj } from "@/components/ui/input-cpf-cnpj";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/components/custom-toast";
import { useGetSellerProdutoBySlug } from "@/app/api/seller-produtos/queries";
import { useIniciarCheckout } from "@/app/api/vendas/mutations";
import {
  checkoutSchema,
  toCheckoutRequest,
  type CheckoutFormData,
} from "@/lib/schemas/checkout";

const formaPagamentoLabels: Record<CheckoutFormData["formaPagamento"], string> = {
  PIX: "PIX",
  BOLETO: "Boleto bancário",
  CREDITO: "Cartão de crédito",
  DOIS_CARTOES: "Dois cartões de crédito",
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CheckoutPage = ({ params }: PageProps) => {
  const { slug } = use(params);
  const router = useRouter();
  const { data: produto, isLoading, isError } = useGetSellerProdutoBySlug(slug);
  const { mutate: iniciar, isPending } = useIniciarCheckout();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onSubmit",
    defaultValues: {
      quantidade: 1,
      formaPagamento: "PIX",
      parcelas: 1,
      cliente: { pais: "BR" },
    },
  });

  const formaPagamento = useWatch({ control, name: "formaPagamento" });
  const quantidade = useWatch({ control, name: "quantidade" });
  const parcelas = useWatch({ control, name: "parcelas" });

  const precoUnitario = produto?.precoVenda ?? 0;
  const totalCalculado = useMemo(
    () => precoUnitario * (quantidade ?? 1),
    [precoUnitario, quantidade],
  );

  const usaCartao =
    formaPagamento === "CREDITO" || formaPagamento === "DOIS_CARTOES";
  const usaDoisCartoes = formaPagamento === "DOIS_CARTOES";

  useEffect(() => {
    if (!usaCartao) {
      setValue("cartao", undefined);
      setValue("cartao2", undefined);
      setValue("valorCartao2", undefined);
      setValue("parcelas", 1);
    } else if (!usaDoisCartoes) {
      setValue("cartao2", undefined);
      setValue("valorCartao2", undefined);
    }
  }, [usaCartao, usaDoisCartoes, setValue]);

  const onSubmit = (data: CheckoutFormData) => {
    if (!produto) return;
    const req = toCheckoutRequest(produto.slugCheckout, data);
    iniciar(req, {
      onSuccess: (resp) => {
        if (typeof window !== "undefined" && resp.pedido?.id) {
          sessionStorage.setItem(
            `checkout:${resp.pedido.id}`,
            JSON.stringify({
              formaPagamento: data.formaPagamento,
              pixQrCode: resp.pixQrCode,
              pixQrCodeUrl: resp.pixQrCodeUrl,
              boletoUrl: resp.boletoUrl,
              boletoLine: resp.boletoLine,
              clienteId: resp.cliente?.id,
              valorTotal: resp.pedido.valorTotal ?? totalCalculado,
              produtoNome: produto.nomeProduto,
            }),
          );
        }
        const pedidoId = resp.pedido?.id ?? "";
        const clienteId = resp.cliente?.id ?? "";
        router.push(
          `/checkout/${slug}/sucesso?pedidoId=${encodeURIComponent(pedidoId)}&clienteId=${encodeURIComponent(clienteId)}`,
        );
      },
      onError: (err) => {
        showToast({
          type: "error",
          title: "Falha ao iniciar pagamento",
          description: err.message || "Tente novamente em instantes.",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div
        data-testid="checkout-loading"
        className="flex min-h-screen items-center justify-center"
      >
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (isError || !produto) {
    return (
      <div
        data-testid="checkout-error"
        className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center"
      >
        <h1 className="text-foreground text-xl font-semibold">
          Checkout não encontrado
        </h1>
        <p className="text-muted-foreground text-sm">
          O link pode estar expirado ou ter sido removido pelo vendedor.
        </p>
      </div>
    );
  }

  const fieldError = (msg?: string) =>
    msg ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500" : "";

  return (
    <div
      data-testid="checkout-page"
      className="relative flex min-h-screen w-full flex-col px-4 py-8 sm:px-6 lg:py-12"
    >
      <BackgroundEffects />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/LOGO-MENU.png"
            alt="Kaiross"
            width={120}
            height={40}
            className="h-auto"
            priority
          />
          <span className="text-muted-foreground text-xs">
            Pagamento processado com segurança
          </span>
          <ShieldCheck className="text-muted-foreground ml-auto h-5 w-5" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            data-testid="checkout-form"
            className="border-border bg-card/95 space-y-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl"
          >
            <section className="space-y-3">
              <h2 className="text-md text-foreground flex items-center gap-2 font-bold">
                <Mail className="h-4 w-4" /> Email pra envio do pedido
              </h2>
              <Input
                data-testid="checkout-input-comprador-email"
                type="email"
                placeholder="seu@email.com"
                {...register("compradorEmail")}
                disabled={isPending}
                className={`bg-input ${fieldError(errors.compradorEmail?.message)}`}
              />
              {errors.compradorEmail && (
                <p className="text-xs text-red-500">
                  {errors.compradorEmail.message}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-md text-foreground flex items-center gap-2 font-bold">
                <User className="h-4 w-4" /> Dados do comprador
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    data-testid="checkout-input-cliente-nome"
                    placeholder="Nome completo"
                    {...register("cliente.nome")}
                    disabled={isPending}
                    className={`bg-input ${fieldError(errors.cliente?.nome?.message)}`}
                  />
                  {errors.cliente?.nome && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.nome.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <InputCpfCnpj
                    data-testid="checkout-input-cliente-documento"
                    {...register("cliente.documento")}
                    onChange={(v) =>
                      setValue("cliente.documento", v, { shouldValidate: false })
                    }
                    disabled={isPending}
                    className={`bg-input ${fieldError(errors.cliente?.documento?.message)}`}
                  />
                  {errors.cliente?.documento && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.documento.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      data-testid="checkout-input-cliente-telefone"
                      placeholder="Telefone (opcional)"
                      {...register("cliente.telefone")}
                      disabled={isPending}
                      className="bg-input pl-9"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-md text-foreground flex items-center gap-2 font-bold">
                <MapPin className="h-4 w-4" /> Endereço de entrega
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Input
                    data-testid="checkout-input-cep"
                    placeholder="CEP"
                    {...register("cliente.cep")}
                    disabled={isPending}
                    className={`bg-input ${fieldError(errors.cliente?.cep?.message)}`}
                  />
                  {errors.cliente?.cep && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.cep.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    data-testid="checkout-input-endereco"
                    placeholder="Endereço"
                    {...register("cliente.endereco")}
                    disabled={isPending}
                    className={`bg-input ${fieldError(errors.cliente?.endereco?.message)}`}
                  />
                  {errors.cliente?.endereco && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.endereco.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Input
                    data-testid="checkout-input-numero"
                    placeholder="Número"
                    {...register("cliente.numero")}
                    disabled={isPending}
                    className={`bg-input ${fieldError(errors.cliente?.numero?.message)}`}
                  />
                  {errors.cliente?.numero && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.numero.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Input
                    data-testid="checkout-input-bairro"
                    placeholder="Bairro (opcional)"
                    {...register("cliente.bairro")}
                    disabled={isPending}
                    className="bg-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Input
                    data-testid="checkout-input-complemento"
                    placeholder="Complemento (opcional)"
                    {...register("cliente.complemento")}
                    disabled={isPending}
                    className="bg-input"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Input
                    data-testid="checkout-input-cidade"
                    placeholder="Cidade"
                    {...register("cliente.cidade")}
                    disabled={isPending}
                    className={`bg-input ${fieldError(errors.cliente?.cidade?.message)}`}
                  />
                  {errors.cliente?.cidade && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.cidade.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Input
                    data-testid="checkout-input-uf"
                    placeholder="UF"
                    maxLength={2}
                    {...register("cliente.uf")}
                    disabled={isPending}
                    className={`bg-input uppercase ${fieldError(errors.cliente?.uf?.message)}`}
                  />
                  {errors.cliente?.uf && (
                    <p className="text-xs text-red-500">
                      {errors.cliente.uf.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-md text-foreground flex items-center gap-2 font-bold">
                <CreditCard className="h-4 w-4" /> Forma de pagamento
              </h2>

              <Select
                value={formaPagamento}
                onValueChange={(v) =>
                  setValue("formaPagamento", v as CheckoutFormData["formaPagamento"], {
                    shouldValidate: true,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger
                  data-testid="checkout-select-forma-pagamento"
                  className="bg-input w-full"
                >
                  <SelectValue placeholder="Escolha como pagar" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(formaPagamentoLabels) as Array<
                    CheckoutFormData["formaPagamento"]
                  >).map((key) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {key === "PIX" && <QrCode className="h-4 w-4" />}
                        {key === "BOLETO" && <FileText className="h-4 w-4" />}
                        {(key === "CREDITO" || key === "DOIS_CARTOES") && (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {formaPagamentoLabels[key]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {usaCartao && (
                <div className="border-border bg-background/40 space-y-3 rounded-lg border p-4">
                  <h3 className="text-foreground text-sm font-semibold">
                    {usaDoisCartoes ? "Cartão 1" : "Dados do cartão"}
                  </h3>
                  <CartaoFields
                    prefix="cartao"
                    register={register}
                    errors={errors.cartao}
                    disabled={isPending}
                  />

                  <div>
                    <label className="text-muted-foreground text-xs">
                      Parcelas
                    </label>
                    <Select
                      value={String(parcelas ?? 1)}
                      onValueChange={(v) =>
                        setValue("parcelas", Number(v), { shouldValidate: false })
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        data-testid="checkout-select-parcelas"
                        className="bg-input mt-1 w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}x de {formatBRL(totalCalculado / n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {usaDoisCartoes && (
                <div className="border-border bg-background/40 space-y-3 rounded-lg border p-4">
                  <h3 className="text-foreground text-sm font-semibold">
                    Cartão 2
                  </h3>
                  <CartaoFields
                    prefix="cartao2"
                    register={register}
                    errors={errors.cartao2}
                    disabled={isPending}
                  />
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs">
                      Valor no cartão 2
                    </label>
                    <Input
                      data-testid="checkout-input-valor-cartao2"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...register("valorCartao2", { valueAsNumber: true })}
                      disabled={isPending}
                      className={`bg-input ${fieldError(errors.valorCartao2?.message)}`}
                    />
                    {errors.valorCartao2 && (
                      <p className="text-xs text-red-500">
                        {errors.valorCartao2.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            <Button
              type="submit"
              data-testid="checkout-button-submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full text-base"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processando…
                </span>
              ) : (
                `Pagar ${formatBRL(totalCalculado)}`
              )}
            </Button>
          </form>

          <aside
            data-testid="checkout-summary"
            className="border-border bg-card/95 sticky top-6 h-fit space-y-4 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex gap-3">
              {produto.imagemPrincipalUrl ? (
                <Image
                  src={produto.imagemPrincipalUrl}
                  alt={produto.nomeProduto}
                  width={72}
                  height={72}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="bg-muted h-[72px] w-[72px] rounded-md" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-semibold">
                  {produto.nomeProduto}
                </p>
                {produto.sku && (
                  <p className="text-muted-foreground text-xs">
                    SKU: {produto.sku}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-sm">
                  {formatBRL(produto.precoVenda)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs">
                Quantidade
              </label>
              <Input
                data-testid="checkout-input-quantidade"
                type="number"
                min={1}
                step={1}
                {...register("quantidade", { valueAsNumber: true })}
                disabled={isPending}
                className="bg-input"
              />
            </div>

            <div className="border-border space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {formatBRL(totalCalculado)}
                </span>
              </div>
              <div className="text-foreground flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatBRL(totalCalculado)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

interface CartaoFieldsProps {
  prefix: "cartao" | "cartao2";
  register: ReturnType<typeof useForm<CheckoutFormData>>["register"];
  errors: ReturnType<typeof useForm<CheckoutFormData>>["formState"]["errors"]["cartao"];
  disabled?: boolean;
}

const CartaoFields = ({ prefix, register, errors, disabled }: CartaoFieldsProps) => {
  const fieldError = (msg?: string) =>
    msg ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500" : "";
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="space-y-1.5 sm:col-span-3">
        <Input
          data-testid={`checkout-input-${prefix}-numero`}
          placeholder="Número do cartão"
          inputMode="numeric"
          {...register(`${prefix}.numero` as const)}
          disabled={disabled}
          className={`bg-input ${fieldError(errors?.numero?.message)}`}
        />
        {errors?.numero && (
          <p className="text-xs text-red-500">{errors.numero.message}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:col-span-3">
        <Input
          data-testid={`checkout-input-${prefix}-titular`}
          placeholder="Nome impresso no cartão"
          {...register(`${prefix}.nomeTitular` as const)}
          disabled={disabled}
          className={`bg-input ${fieldError(errors?.nomeTitular?.message)}`}
        />
        {errors?.nomeTitular && (
          <p className="text-xs text-red-500">{errors.nomeTitular.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Input
          data-testid={`checkout-input-${prefix}-mes`}
          type="number"
          min={1}
          max={12}
          placeholder="Mês"
          {...register(`${prefix}.mesExpiracao` as const, { valueAsNumber: true })}
          disabled={disabled}
          className={`bg-input ${fieldError(errors?.mesExpiracao?.message)}`}
        />
      </div>

      <div className="space-y-1.5">
        <Input
          data-testid={`checkout-input-${prefix}-ano`}
          type="number"
          min={new Date().getFullYear()}
          placeholder="Ano"
          {...register(`${prefix}.anoExpiracao` as const, { valueAsNumber: true })}
          disabled={disabled}
          className={`bg-input ${fieldError(errors?.anoExpiracao?.message)}`}
        />
      </div>

      <div className="space-y-1.5">
        <Input
          data-testid={`checkout-input-${prefix}-cvv`}
          placeholder="CVV"
          inputMode="numeric"
          maxLength={4}
          {...register(`${prefix}.cvv` as const)}
          disabled={disabled}
          className={`bg-input ${fieldError(errors?.cvv?.message)}`}
        />
        {errors?.cvv && (
          <p className="text-xs text-red-500">{errors.cvv.message}</p>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
