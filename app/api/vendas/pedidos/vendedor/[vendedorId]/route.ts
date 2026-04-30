import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";
import type { PedidoView } from "../../../types";

  process.env.VENDAS_API_URL ?? process.env.API_URL ?? "";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendedorId: string }> },
) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { vendedorId } = await context.params;
  if (!vendedorId) {
    return NextResponse.json(
      { error: "vendedorId é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const response = await backend.get<PedidoView[]>(
      `vendas/pedidos/vendedor/${vendedorId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return NextResponse.json(response.data ?? []);
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
          "Erro ao listar pedidos do vendedor.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
