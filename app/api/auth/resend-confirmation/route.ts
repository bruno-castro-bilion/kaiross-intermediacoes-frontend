import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";

// Reenvia link de confirmação de email. Backend nunca revela se a conta
// existe / está pendente — sempre retorna 200 com mensagem genérica.
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
      `auth/resend-confirmation`,
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
        : serverMessage || "Erro ao reenviar email de confirmação.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Se houver uma conta pendente para esse email, um novo link foi enviado.",
    },
    { status: 200 },
  );
}
