import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import { vendasBackend } from "@/app/api/_backend";
import type { CheckoutResponse, IniciarCheckoutRequest } from "../types";

export async function POST(request: NextRequest) {
  let body: IniciarCheckoutRequest;
  try {
    body = (await request.json()) as IniciarCheckoutRequest;
  } catch {
    return NextResponse.json(
      { error: "Payload inválido." },
      { status: 400 },
    );
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  try {
    const response = await vendasBackend.post<CheckoutResponse>(
      "vendas/checkout",
      body,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      mensagem?: string;
      error?: string;
    }>;
    const status = axiosError.response?.status ?? 0;
    const responseData = axiosError.response?.data;

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao iniciar checkout.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
