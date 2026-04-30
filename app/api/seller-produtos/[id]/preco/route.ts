import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";
import type { AtualizarPrecoRequest, SellerProdutoView } from "../../types";

  process.env.SELLER_PRODUTOS_API_URL ?? process.env.API_URL ?? "";

export async function PUT(
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
      { error: "ID do produto é obrigatório." },
      { status: 400 },
    );
  }

  let body: AtualizarPrecoRequest;
  try {
    body = (await request.json()) as AtualizarPrecoRequest;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  if (typeof body?.precoVenda !== "number" || body.precoVenda < 0) {
    return NextResponse.json(
      { error: "precoVenda (>= 0) é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const response = await backend.put<SellerProdutoView>(
      `seller-produtos/${id}/preco`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
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
        { error: "Afiliação não encontrada." },
        { status: 404 },
      );
    }

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao atualizar preço de venda.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
