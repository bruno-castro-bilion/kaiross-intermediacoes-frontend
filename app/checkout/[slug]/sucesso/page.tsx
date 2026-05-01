"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  QrCode,
  XCircle,
} from "lucide-react";

import BackgroundEffects from "@/components/background-effects";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/custom-toast";
import { useGetPedido } from "@/app/api/vendas/queries";
import type { FormaPagamento } from "@/app/api/vendas/types";

interface CheckoutSessionData {
  formaPagamento: FormaPagamento;
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  boletoUrl?: string;
  boletoLine?: string;
  clienteId?: string;
  valorTotal?: number;
  produtoNome?: string;
}

function readSession(pedidoId: string): CheckoutSessionData | null {
  if (typeof window === "undefined" || !pedidoId) return null;
  const raw = sessionStorage.getItem(`checkout:${pedidoId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutSessionData;
  } catch {
    return null;
  }
}

const formatBRL = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value)
    : "—";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SuccessPage = ({ params }: PageProps) => {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId") ?? "";
  const clienteId = searchParams.get("clienteId") ?? "";

  const queryClient = useQueryClient();
  const [session] = useState<CheckoutSessionData | null>(() =>
    readSession(pedidoId),
  );

  const { data: pedido, isError: isPedidoError } = useGetPedido(
    pedidoId || undefined,
  );

  const status = pedido?.status;
  const isPending = !status || status === "PENDENTE";
  const isPaid = status === "PAGO";
  const isFailed = status === "FALHA";

  useEffect(() => {
    // Pra polling. Anônimo recebe 401 do BFF (endpoint requer auth),
    // então paramos pra não bombardear.
    if (!isPending || !pedidoId || isPedidoError) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["vendas", "pedidos", pedidoId],
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPending, pedidoId, isPedidoError, queryClient]);

  const formaPagamento = session?.formaPagamento;

  const heading = useMemo(() => {
    if (isPaid) return "Pagamento confirmado!";
    if (isFailed) return "Pagamento não autorizado";
    if (formaPagamento === "PIX") return "Escaneie o QR Code pra pagar";
    if (formaPagamento === "BOLETO") return "Boleto gerado";
    if (formaPagamento === "CREDITO" || formaPagamento === "DOIS_CARTOES")
      return "Pagamento em análise";
    return "Pedido recebido";
  }, [isPaid, isFailed, formaPagamento]);

  const HeadingIcon = isPaid ? CheckCircle2 : isFailed ? XCircle : Clock;
  const headingColor = isPaid
    ? "text-green-500"
    : isFailed
      ? "text-red-500"
      : "text-yellow-500";

  const copy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast({ type: "success", title: "Copiado!" });
    });
  };

  if (!pedidoId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-foreground text-xl font-semibold">
          Pedido não identificado
        </h1>
        <Button onClick={() => router.push(`/checkout/${slug}`)}>
          Voltar pro checkout
        </Button>
      </div>
    );
  }

  return (
    <div
      data-testid="checkout-sucesso-page"
      className="relative flex min-h-screen w-full flex-col px-4 py-8 sm:px-6 lg:py-12"
    >
      <BackgroundEffects />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Image
            src="/LOGO-MENU.png"
            alt="Kaiross"
            width={120}
            height={40}
            className="h-auto"
            priority
          />
        </div>

        <div
          data-testid="checkout-sucesso-card"
          className="border-border bg-card/95 space-y-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <HeadingIcon className={`h-12 w-12 ${headingColor}`} />
            <h1
              data-testid="checkout-sucesso-heading"
              className="text-foreground text-xl font-semibold sm:text-2xl"
            >
              {heading}
            </h1>
            {session?.produtoNome && (
              <p className="text-muted-foreground text-sm">
                {session.produtoNome} —{" "}
                <span className="text-foreground font-semibold">
                  {formatBRL(session.valorTotal)}
                </span>
              </p>
            )}
          </div>

          {isPaid && (
            <div className="border-border bg-background/40 space-y-2 rounded-lg border p-4 text-center">
              <p className="text-foreground text-sm">
                Recebemos a confirmação da pagar.me. Você vai receber um email
                com o comprovante e os detalhes do pedido.
              </p>
            </div>
          )}

          {isFailed && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-center">
              <p className="text-foreground text-sm">
                A operadora não autorizou o pagamento. Tente novamente com outro
                método ou cartão.
              </p>
              <Button
                onClick={() => router.push(`/checkout/${slug}`)}
                className="mt-3"
              >
                Tentar de novo
              </Button>
            </div>
          )}

          {isPending && formaPagamento === "PIX" && session && (
            <div className="space-y-4">
              <div className="bg-background/40 flex flex-col items-center gap-3 rounded-lg p-4">
                <QrCode className="text-muted-foreground h-5 w-5" />
                {session.pixQrCodeUrl ? (
                  <Image
                    src={session.pixQrCodeUrl}
                    alt="QR Code PIX"
                    width={220}
                    height={220}
                    unoptimized
                    className="rounded-md bg-white p-2"
                  />
                ) : null}
                {session.pixQrCode && (
                  <div className="w-full">
                    <p className="text-muted-foreground mb-1 text-xs">
                      PIX copia e cola
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-input text-foreground flex-1 truncate rounded px-3 py-2 text-xs">
                        {session.pixQrCode}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copy(session.pixQrCode)}
                        aria-label="Copiar código PIX"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-muted-foreground text-xs">
                  Estamos aguardando a confirmação da pagar.me. Esta página
                  atualiza sozinha quando o pagamento entrar.
                </p>
              </div>
            </div>
          )}

          {isPending && formaPagamento === "BOLETO" && session && (
            <div className="space-y-3">
              <div className="bg-background/40 space-y-3 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground text-sm font-semibold">
                    Boleto bancário
                  </span>
                </div>
                {session.boletoLine && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Linha digitável
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-input text-foreground flex-1 truncate rounded px-3 py-2 text-xs">
                        {session.boletoLine}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copy(session.boletoLine)}
                        aria-label="Copiar linha digitável"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {session.boletoUrl && (
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={session.boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visualizar boleto
                    </a>
                  </Button>
                )}
                <p className="text-muted-foreground text-xs">
                  Compensação em até 3 dias úteis. Avisaremos por email quando
                  for confirmado.
                </p>
              </div>
            </div>
          )}

          {isPending && (formaPagamento === "CREDITO" || formaPagamento === "DOIS_CARTOES") && (
            <div className="border-border bg-background/40 rounded-lg border p-4 text-center">
              <p className="text-foreground text-sm">
                Estamos aguardando a confirmação da operadora do cartão. Em
                alguns segundos você verá o resultado aqui.
              </p>
            </div>
          )}

          {isPending && !session && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-center">
              <p className="text-foreground text-sm">
                Estamos processando seu pedido. Enviaremos as instruções de
                pagamento pro email cadastrado.
              </p>
            </div>
          )}

          <div className="border-border space-y-2 border-t pt-4 text-center">
            {clienteId && !isFailed && (
              <Button asChild className="w-full">
                <Link
                  href={`/signup?clienteId=${encodeURIComponent(clienteId)}&role=COMPRADOR`}
                >
                  Crie uma senha pra acompanhar seus pedidos
                </Link>
              </Button>
            )}
            <p className="text-muted-foreground text-xs">
              Pedido <span className="text-foreground">{pedidoId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
