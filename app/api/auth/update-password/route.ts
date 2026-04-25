import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { handleFormatAccessToken } from "@/utils/utils";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const authHeader = request.headers.get("authorization");
    const headers = authHeader
      ? { Authorization: authHeader }
      : handleFormatAccessToken(request);

    const response = await axios.patch(
      `${process.env.API_URL}/auth/resetPassword`,
      { senha: body.senha },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json({ authData: response.data }, { status: 200 });
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
          "Erro ao atualizar senha.";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
