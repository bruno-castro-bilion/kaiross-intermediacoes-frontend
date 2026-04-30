import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { SellerProdutoView } from "../../types";

const API_URL =
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

  try {
    const response = await axios.put<SellerProdutoView>(
      `${API_URL}/seller-produtos/${id}/reativar`,
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
        { error: "Afiliação não encontrada." },
        { status: 404 },
      );
    }
    if (status === 403) {
      return NextResponse.json(
        { error: "Você não tem permissão para reativar esta afiliação." },
        { status: 403 },
      );
    }

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : responseData?.message ||
        responseData?.mensagem ||
        responseData?.error ||
        "Erro ao reativar produto na vitrine.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
