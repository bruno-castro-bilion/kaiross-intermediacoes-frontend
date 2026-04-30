import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

const API_URL =
  process.env.SELLER_PRODUTOS_API_URL ?? process.env.API_URL ?? "";

export async function DELETE(
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
    await axios.delete(`${API_URL}/seller-produtos/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json({ success: true });
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
        { error: "Você não tem permissão para remover esta afiliação." },
        { status: 403 },
      );
    }

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao remover produto da vitrine.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
