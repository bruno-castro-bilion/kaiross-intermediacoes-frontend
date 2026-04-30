import { NextResponse } from "next/server";

// O auth-service Java ainda não expõe reset/forgot-password. Quando o
// endpoint for criado:
//   POST /api/auth/forgot-password  body { email }  -> 200 (envia e-mail
//   com token via SES)
// trocar este handler por um proxy real e remover este 501.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Recuperação de senha ainda não disponível. Entre em contato com o suporte.",
      code: "RESET_PASSWORD_NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}
