import { z } from "zod";
import {
  onlyDigits,
  isValidCpf,
  isValidCnpj,
} from "../validators/identification";

export type SettingsEmailData = z.infer<typeof settingsEmailSchema>;

export const settingsEmailSchema = z
  .object({
    email: z
      .email("Email inválido")
      .min(1, "Email é obrigatório")
      .toLowerCase(),

    emailConfirmation: z
      .email("Email inválido")
      .min(1, "Confirmação de email é obrigatória")
      .toLowerCase(),
  })
  .refine((data) => data.email === data.emailConfirmation, {
    message: "Os emails não coincidem",
    path: ["emailConfirmation"],
  });

export const personalInfoSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  document: z
    .string()
    .min(1, "Documento é obrigatório")
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length === 11
        ? isValidCpf(d)
        : d.length === 14
          ? isValidCnpj(d)
          : false;
    }, "Documento (CPF/CNPJ) inválido"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .transform((s) => onlyDigits(String(s).trim()))
    .refine(
      (d) => typeof d === "string" && d.replace(/\D/g, "").length >= 9,
      "Telefone inválido",
    )
    .transform((d) => String(d).replace(/\D/g, "").slice(-9)),
  codigoPais: z.string().optional(),
  ddd: z.string().optional(),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;

export function validatePersonalInfo(data: unknown) {
  return personalInfoSchema.safeParse(data);
}

export const addressSchema = z.object({
  cep: z
    .string()
    .min(8, "CEP inválido")
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length === 8;
    }, "CEP inválido"),
  country: z.string().min(2, "País é obrigatório"),
  state: z.string().min(2, "Estado é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  address: z.string().min(3, "Endereço é obrigatório"),
  numero: z.string().refine((v) => /^\d+$/.test(String(v).trim()), {
    message: "Número inválido (somente dígitos)",
  }),
  bairro: z.string().min(2, "Bairro é obrigatório"),
});

export type AddressData = z.infer<typeof addressSchema>;

export function validateAddress(data: unknown) {
  return addressSchema.safeParse(data);
}
