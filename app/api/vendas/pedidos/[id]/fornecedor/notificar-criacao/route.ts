import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";

export const dynamic = "force-dynamic";

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
    const response = await backend.post(
      `vendas/pedidos/${id}/fornecedor/notificar-criacao`,
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
    if (status === 400) {
      return NextResponse.json(
        {
          error:
            responseData?.message ||
            responseData?.mensagem ||
            responseData?.error ||
            "Pedido não pode ser enviado ao fornecedor neste status.",
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
          "Erro ao notificar fornecedor.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
