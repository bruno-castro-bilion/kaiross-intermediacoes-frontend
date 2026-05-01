import { z } from "zod";
import type {
  DadosCartao,
  DadosCliente,
  FormaPagamento,
  IniciarCheckoutRequest,
} from "@/app/api/vendas/types";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const cartaoSchema = z.object({
  numero: z
    .string()
    .min(13, "Número do cartão inválido")
    .max(19, "Número do cartão inválido")
    .transform(onlyDigits)
    .refine((v) => v.length >= 13 && v.length <= 19, {
      message: "Número do cartão inválido",
    }),
  nomeTitular: z
    .string()
    .min(3, "Nome do titular obrigatório")
    .max(120, "Nome do titular muito longo"),
  mesExpiracao: z
    .number()
    .int()
    .min(1, "Mês inválido")
    .max(12, "Mês inválido"),
  anoExpiracao: z
    .number()
    .int()
    .min(new Date().getFullYear(), "Ano inválido"),
  cvv: z
    .string()
    .min(3, "CVV inválido")
    .max(4, "CVV inválido")
    .regex(/^\d+$/, "CVV inválido"),
});

const clienteSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório").max(255, "Nome muito longo"),
  email: z.email("Email inválido").optional().or(z.literal("")),
  documento: z
    .string()
    .min(1, "CPF/CNPJ obrigatório")
    .transform(onlyDigits)
    .refine((v) => v.length === 11 || v.length === 14, {
      message: "CPF deve ter 11 dígitos ou CNPJ 14 dígitos",
    }),
  telefone: z.string().optional().or(z.literal("")),
  cep: z
    .string()
    .min(1, "CEP obrigatório")
    .transform(onlyDigits)
    .refine((v) => v.length === 8, { message: "CEP deve ter 8 dígitos" }),
  endereco: z
    .string()
    .min(1, "Endereço obrigatório")
    .max(255, "Endereço muito longo"),
  numero: z.string().min(1, "Número obrigatório").max(40, "Número muito longo"),
  bairro: z.string().max(120, "Bairro muito longo").optional().or(z.literal("")),
  complemento: z
    .string()
    .max(120, "Complemento muito longo")
    .optional()
    .or(z.literal("")),
  cidade: z.string().min(1, "Cidade obrigatória").max(120, "Cidade muito longa"),
  uf: z
    .string()
    .min(2, "UF obrigatória")
    .max(2, "UF deve ter 2 letras")
    .transform((v) => v.toUpperCase()),
  pais: z.string().max(10, "País muito longo").optional().or(z.literal("")),
});

export const checkoutSchema = z
  .object({
    compradorEmail: z
      .email("Email inválido")
      .min(1, "Email obrigatório")
      .toLowerCase(),
    quantidade: z.number().int().min(1, "Quantidade mínima 1"),
    cliente: clienteSchema,
    formaPagamento: z.enum(["CREDITO", "DOIS_CARTOES", "PIX", "BOLETO"]),
    parcelas: z
      .number()
      .int()
      .min(1)
      .max(12)
      .optional(),
    cartao: cartaoSchema.optional(),
    cartao2: cartaoSchema.optional(),
    valorCartao2: z.number().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.formaPagamento === "CREDITO" && !data.cartao) {
      ctx.addIssue({
        code: "custom",
        message: "Dados do cartão obrigatórios",
        path: ["cartao"],
      });
    }
    if (data.formaPagamento === "DOIS_CARTOES") {
      if (!data.cartao) {
        ctx.addIssue({
          code: "custom",
          message: "Dados do primeiro cartão obrigatórios",
          path: ["cartao"],
        });
      }
      if (!data.cartao2) {
        ctx.addIssue({
          code: "custom",
          message: "Dados do segundo cartão obrigatórios",
          path: ["cartao2"],
        });
      }
      if (!data.valorCartao2 || data.valorCartao2 <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Valor do segundo cartão obrigatório",
          path: ["valorCartao2"],
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function toCheckoutRequest(
  slugCheckout: string,
  data: CheckoutFormData,
): IniciarCheckoutRequest {
  const cliente: DadosCliente = {
    nome: data.cliente.nome,
    email: data.cliente.email || undefined,
    documento: data.cliente.documento,
    telefone: data.cliente.telefone || undefined,
    cep: data.cliente.cep,
    endereco: data.cliente.endereco,
    numero: data.cliente.numero,
    bairro: data.cliente.bairro || undefined,
    complemento: data.cliente.complemento || undefined,
    cidade: data.cliente.cidade,
    uf: data.cliente.uf,
    pais: data.cliente.pais || undefined,
  };

  const usaCartao =
    data.formaPagamento === "CREDITO" || data.formaPagamento === "DOIS_CARTOES";

  return {
    slugCheckout,
    compradorEmail: data.compradorEmail,
    quantidade: data.quantidade,
    cliente,
    formaPagamento: data.formaPagamento as FormaPagamento,
    parcelas: usaCartao ? data.parcelas ?? 1 : undefined,
    cartao: usaCartao ? (data.cartao as DadosCartao) : undefined,
    cartao2:
      data.formaPagamento === "DOIS_CARTOES"
        ? (data.cartao2 as DadosCartao)
        : undefined,
    valorCartao2:
      data.formaPagamento === "DOIS_CARTOES" ? data.valorCartao2 : undefined,
  };
}
