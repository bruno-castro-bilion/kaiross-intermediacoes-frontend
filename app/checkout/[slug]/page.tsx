"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  FileText,
  Loader2,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
  User,
  Wallet,
} from "lucide-react";

import BackgroundEffects from "@/components/background-effects";
import CheckoutStepper from "@/components/checkout/checkout-stepper";
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
import { lookupCep } from "@/lib/api/cep";

type FormaPagamentoKey = CheckoutFormData["formaPagamento"];

const STEPS = [
  { key: "dados", label: "Seus dados" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
];

const STEP_FIELDS: Record<number, FieldPath<CheckoutFormData>[]> = {
  0: ["compradorEmail", "cliente.nome", "cliente.documento"],
  1: [
    "cliente.cep",
    "cliente.endereco",
    "cliente.numero",
    "cliente.cidade",
    "cliente.uf",
  ],
  2: ["formaPagamento", "cartao", "cartao2", "valorCartao2", "parcelas"],
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

  const [step, setStep] = useState(0);
  const [cepLoading, setCepLoading] = useState(false);
  const lastCepLookup = useRef<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    trigger,
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

  // Reset cartões/parcelas se mudou pra forma sem cartão.
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

  // CEP lookup chamado direto no onChange do input. Evita useEffect+setState
  // (anti-pattern apontado pelo react-hooks/set-state-in-effect).
  const handleCepChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8 || digits === lastCepLookup.current) return;
    lastCepLookup.current = digits;
    setCepLoading(true);
    lookupCep(digits)
      .then((res) => {
        if (res.endereco) setValue("cliente.endereco", res.endereco);
        if (res.bairro) setValue("cliente.bairro", res.bairro);
        if (res.cidade) setValue("cliente.cidade", res.cidade);
        if (res.uf) setValue("cliente.uf", res.uf);
      })
      .catch((e: Error) => {
        showToast({
          type: "warning",
          title: "Não consegui preencher o endereço",
          description: e.message,
        });
      })
      .finally(() => setCepLoading(false));
  };

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    // Foco no primeiro campo do próximo step.
    const firstField = STEP_FIELDS[next]?.[0];
    if (firstField) {
      setTimeout(() => setFocus(firstField), 50);
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = (data: CheckoutFormData) => {
    // Defesa contra Enter no input em steps anteriores: o browser pode
    // auto-submeter o form, e como formaPagamento default = "PIX" passa
    // na validação. Só finaliza de fato no último step.
    if (step !== STEPS.length - 1) return;
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
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
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
    msg
      ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
      : "";

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
            onKeyDown={(e) => {
              // Enter num input em step intermediário avança em vez de
              // disparar o submit nativo do browser.
              if (
                e.key === "Enter" &&
                step < STEPS.length - 1 &&
                (e.target as HTMLElement).tagName === "INPUT"
              ) {
                e.preventDefault();
                goNext();
              }
            }}
            data-testid="checkout-form"
            className="border-border bg-card/95 space-y-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl"
          >
            <CheckoutStepper
              steps={STEPS}
              current={step}
              onJumpTo={(i) => setStep(i)}
            />

            {step === 0 && (
              <section className="space-y-4">
                <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                  <User className="h-4 w-4" /> Seus dados
                </h2>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs">
                    Nome completo
                  </label>
                  <Input
                    data-testid="checkout-input-cliente-nome"
                    placeholder="João da Silva"
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
                  <label className="text-muted-foreground text-xs">
                    E-mail
                  </label>
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
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs">
                      CPF / CNPJ
                    </label>
                    <InputCpfCnpj
                      data-testid="checkout-input-cliente-documento"
                      {...register("cliente.documento")}
                      onChange={(v) =>
                        setValue("cliente.documento", v, {
                          shouldValidate: false,
                        })
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
                    <label className="text-muted-foreground text-xs">
                      Celular (opcional)
                    </label>
                    <Input
                      data-testid="checkout-input-cliente-telefone"
                      placeholder="(11) 91234-5678"
                      {...register("cliente.telefone")}
                      disabled={isPending}
                      className="bg-input"
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-4">
                <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-4 w-4" /> Endereço de entrega
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs">
                      CEP
                    </label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="cliente.cep"
                        render={({ field }) => (
                          <Input
                            data-testid="checkout-input-cep"
                            placeholder="00000-000"
                            inputMode="numeric"
                            maxLength={9}
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              handleCepChange(e.target.value);
                            }}
                            disabled={isPending}
                            className={`bg-input ${fieldError(errors.cliente?.cep?.message)}`}
                          />
                        )}
                      />
                      {cepLoading && (
                        <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                      )}
                    </div>
                    {errors.cliente?.cep && (
                      <p className="text-xs text-red-500">
                        {errors.cliente.cep.message}
                      </p>
                    )}
                    <a
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-[11px] underline"
                    >
                      Não sei meu CEP
                    </a>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-muted-foreground text-xs">
                      Endereço
                    </label>
                    <Input
                      data-testid="checkout-input-endereco"
                      placeholder="Rua, avenida..."
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
                    <label className="text-muted-foreground text-xs">
                      Número
                    </label>
                    <Input
                      data-testid="checkout-input-numero"
                      placeholder="123"
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
                    <label className="text-muted-foreground text-xs">
                      Bairro
                    </label>
                    <Input
                      data-testid="checkout-input-bairro"
                      placeholder="Bairro"
                      {...register("cliente.bairro")}
                      disabled={isPending}
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs">
                      Complemento
                    </label>
                    <Input
                      data-testid="checkout-input-complemento"
                      placeholder="Apto, bloco..."
                      {...register("cliente.complemento")}
                      disabled={isPending}
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-muted-foreground text-xs">
                      Cidade
                    </label>
                    <Input
                      data-testid="checkout-input-cidade"
                      placeholder="São Paulo"
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
                    <label className="text-muted-foreground text-xs">UF</label>
                    <Input
                      data-testid="checkout-input-uf"
                      placeholder="SP"
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
            )}

            {step === 2 && (
              <section className="space-y-5">
                <div
                  data-testid="checkout-orderbump-placeholder"
                  className="rounded-lg border border-dashed border-yellow-500/40 bg-yellow-500/5 p-4"
                >
                  <p className="text-foreground text-sm font-semibold">
                    🎁 Oferta exclusiva
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Em breve: produtos complementares aparecem aqui pra adicionar
                    ao pedido com 1 clique.
                  </p>
                </div>

                <div className="space-y-3">
                  <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                    <Wallet className="h-4 w-4" /> Forma de pagamento
                  </h2>

                  <div className="grid gap-2">
                    {(
                      [
                        {
                          key: "PIX",
                          icon: QrCode,
                          title: "PIX",
                          subtitle: "Aprovação imediata",
                        },
                        {
                          key: "CREDITO",
                          icon: CreditCard,
                          title: "Cartão de crédito",
                          subtitle: "Até 12x sem juros do vendedor",
                        },
                        {
                          key: "DOIS_CARTOES",
                          icon: CreditCard,
                          title: "2 cartões",
                          subtitle: "Divida o valor entre dois cartões",
                        },
                        {
                          key: "BOLETO",
                          icon: FileText,
                          title: "Boleto bancário",
                          subtitle: "Compensa em até 3 dias úteis",
                        },
                      ] satisfies Array<{
                        key: FormaPagamentoKey;
                        icon: typeof QrCode;
                        title: string;
                        subtitle: string;
                      }>
                    ).map(({ key, icon: Icon, title, subtitle }) => {
                      const selected = formaPagamento === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          data-testid={`checkout-pagamento-${key}`}
                          onClick={() =>
                            setValue("formaPagamento", key, {
                              shouldValidate: true,
                            })
                          }
                          className={`border-border bg-input flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                              : "hover:border-muted-foreground"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-md ${
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="text-foreground block text-sm font-semibold">
                              {title}
                            </span>
                            <span className="text-muted-foreground block text-xs">
                              {subtitle}
                            </span>
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border ${
                              selected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                            aria-hidden
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                          setValue("parcelas", Number(v), {
                            shouldValidate: false,
                          })
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
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n}x de {formatBRL(totalCalculado / n)}
                              </SelectItem>
                            ),
                          )}
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
            )}

            <div className="border-border flex items-center justify-between gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0 || isPending}
                data-testid="checkout-button-voltar"
              >
                Voltar
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={isPending}
                  data-testid="checkout-button-continuar"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  data-testid="checkout-button-submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 text-base"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processando…
                    </span>
                  ) : (
                    `Finalizar compra · ${formatBRL(totalCalculado)}`
                  )}
                </Button>
              )}
            </div>

            <div
              data-testid="checkout-trust-badges"
              className="text-muted-foreground border-border flex flex-wrap items-center justify-center gap-4 border-t pt-4 text-xs"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Compra protegida
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Pagamento seguro
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Frete rastreado
              </span>
            </div>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className="text-muted-foreground">a calcular</span>
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
  errors: ReturnType<
    typeof useForm<CheckoutFormData>
  >["formState"]["errors"]["cartao"];
  disabled?: boolean;
}

const CartaoFields = ({
  prefix,
  register,
  errors,
  disabled,
}: CartaoFieldsProps) => {
  const fieldError = (msg?: string) =>
    msg
      ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
      : "";
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
          {...register(`${prefix}.mesExpiracao` as const, {
            valueAsNumber: true,
          })}
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
          {...register(`${prefix}.anoExpiracao` as const, {
            valueAsNumber: true,
          })}
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
