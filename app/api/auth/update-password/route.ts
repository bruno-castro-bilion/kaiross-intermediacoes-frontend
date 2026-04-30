import { NextResponse } from "next/server";

// O auth-service Java ainda não expõe troca de senha autenticada. Quando o
// endpoint for criado:
//   PATCH /api/auth/password  body { senha }  (consome JWT do header)
// trocar este handler por um proxy real e remover este 501.
export async function PATCH() {
  return NextResponse.json(
    {
      error:
        "Atualização de senha ainda não disponível. Entre em contato com o suporte.",
      code: "UPDATE_PASSWORD_NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}
