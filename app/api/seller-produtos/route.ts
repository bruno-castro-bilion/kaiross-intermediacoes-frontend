import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";
import type { AfiliarProdutoRequest, SellerProdutoView } from "./types";

// Garante que o handler é tratado como dinâmico (sem cache de resposta).
// As rotas leem request.cookies, o que já força dinâmico, mas declarar
// explicitamente evita surpresa em build/SSR.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
} as const;

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const response = await backend.get<SellerProdutoView[]>(
      `seller-produtos`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return NextResponse.json(response.data, { headers: NO_CACHE_HEADERS });
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
          "Erro ao listar produtos afiliados.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: AfiliarProdutoRequest;
  try {
    body = (await request.json()) as AfiliarProdutoRequest;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  if (!body?.produtoId || typeof body.precoVenda !== "number" || body.precoVenda < 0) {
    return NextResponse.json(
      { error: "produtoId e precoVenda (>= 0) são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const response = await backend.post(
      `seller-produtos`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return NextResponse.json(response.data ?? { success: true }, {
      status: response.status === 200 ? 201 : response.status,
    });
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
          "Erro ao afiliar produto.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }
}
