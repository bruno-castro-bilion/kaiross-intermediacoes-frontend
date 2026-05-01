import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";

// Inicia fluxo de "esqueci minha senha". Backend nunca revela se o email
// existe — sempre retorna 200 com mensagem genérica (anti-enumeração).
// Em caso de erro real (5xx), reportamos como erro de sistema.
export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Email é obrigatório." },
      { status: 400 },
    );
  }

  try {
    await backend.post(
      `auth/forgot-password`,
      { email },
      { headers: { "x-api-key": process.env.API_KEY } },
    );
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      mensagem?: string;
    }>;
    const status = axiosError.response?.status ?? 0;
    const responseData = axiosError.response?.data;
    const serverMessage =
      responseData?.message || responseData?.mensagem || responseData?.error;

    const genericMessage =
      "Sistema temporariamente indisponível. Tente novamente mais tarde.";
    const errorMessage =
      status === 0 || status >= 500
        ? genericMessage
        : serverMessage || "Erro ao iniciar redefinição de senha.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Se houver uma conta para esse email, um link de redefinição foi enviado.",
    },
    { status: 200 },
  );
}
