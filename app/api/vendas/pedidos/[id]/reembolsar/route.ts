import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { PedidoView } from "../../../types";

const API_URL =
  process.env.VENDAS_API_URL ?? process.env.API_URL ?? "";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: "ID do pedido é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const response = await axios.post<PedidoView>(
      `${API_URL}/vendas/pedidos/${id}/reembolsar`,
      undefined,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      mensagem?: string;
      error?: string;
    }>;
    const status = axiosError.response?.status ?? 0;
    const responseData = axiosError.response?.data;

    if (status === 404) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }
    if (status === 409 || status === 400) {
      return NextResponse.json(
        {
          error:
            responseData?.message ||
            responseData?.mensagem ||
            responseData?.error ||
            "Pedido não pode ser reembolsado neste status.",
        },
        { status },
      );
    }

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao processar reembolso.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
