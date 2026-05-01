import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import { sellerProdutosBackend } from "@/app/api/_backend";
import type { SellerProdutoView } from "../../types";

// Endpoint público no backend (sem BearerAuth na OpenAPI), mas mantemos o
// proxy no BFF por consistência — passamos o token se houver.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json(
      { error: "Slug é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const response = await sellerProdutosBackend.get<SellerProdutoView>(
      `seller-produtos/checkout/${slug}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
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
        { error: "Checkout não encontrado." },
        { status: 404 },
      );
    }

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao buscar checkout.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
