import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";

// Confirma email do usuário via token enviado por email no signup.
// Backend valida token (single-use, TTL 24h) e seta usuario.email_confirmado=true.
export async function POST(request: NextRequest) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json(
      { error: "Token é obrigatório." },
      { status: 400 },
    );
  }

  try {
    await backend.post(
      `auth/confirm-email`,
      { token },
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

    if (status === 400) {
      return NextResponse.json(
        { error: serverMessage || "Link inválido ou expirado." },
        { status: 400 },
      );
    }

    const genericMessage =
      "Sistema temporariamente indisponível. Tente novamente mais tarde.";
    const errorMessage =
      status === 0 || status >= 500
        ? genericMessage
        : serverMessage || "Erro ao confirmar email.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }

  return NextResponse.json(
    { success: true, message: "Email confirmado." },
    { status: 200 },
  );
}
