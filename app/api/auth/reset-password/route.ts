import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await axios.post(`${process.env.API_URL}/auth/resetPassword`, {
      email: body.email,
    });

    return NextResponse.json(
      { message: "Email de recuperação enviado." },
      { status: 200 },
    );
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      mensagem?: string;
    }>;

    const status = axiosError.response?.status || 500;
    const responseData = axiosError.response?.data as
      | { message?: string; error?: string; mensagem?: string }
      | undefined;

    const genericMessage =
      "Sistema temporariamente indisponível. Tente novamente mais tarde.";

    const errorMessage =
      status === 500
        ? genericMessage
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao enviar e-mail de redefinição de senha.";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
