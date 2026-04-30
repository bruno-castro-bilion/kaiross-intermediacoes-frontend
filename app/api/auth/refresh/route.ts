import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { JavaAuthResponse } from "../types";

const API_URL = process.env.API_URL ?? "";
const isProduction = process.env.NODE_ENV === "production";
const isHomolog =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";

function decodeJwtPayload(token: string): { exp?: number; iat?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    const json = Buffer.from(
      padded.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Rotaciona o par access+refresh chamando o backend (auth-service Java).
 * O refresh token vive em cookie httpOnly path=/api/auth — nunca toca o JS.
 * Nas respostas com sucesso, emitimos um par novo e atualizamos os cookies.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token ausente." },
      { status: 401 },
    );
  }

  let upstream: JavaAuthResponse;
  try {
    const response = await axios.post<JavaAuthResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    upstream = response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      mensagem?: string;
      error?: string;
    }>;
    const status = axiosError.response?.status ?? 0;

    // 401/403 = refresh inválido/expirado — limpa cookies e devolve 401 pro
    // hook de expiração disparar logout local.
    if (status === 401 || status === 403) {
      const res = NextResponse.json(
        { error: "Sessão expirada. Faça login novamente." },
        { status: 401 },
      );
      res.cookies.delete("accessToken");
      res.cookies.delete({ name: "refreshToken", path: "/api/auth" });
      res.cookies.delete("userRole");
      return res;
    }

    const errorMessage =
      status === 0 || status >= 500
        ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
        : axiosError.response?.data?.message ||
          axiosError.response?.data?.mensagem ||
          axiosError.response?.data?.error ||
          "Erro ao renovar sessão.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }

  const payload = decodeJwtPayload(upstream.token);
  const nowSec = Math.floor(Date.now() / 1000);
  const tokenLifetimeSec =
    payload?.exp && payload.exp > nowSec ? payload.exp - nowSec : 5400;

  const res = NextResponse.json({ ok: true }, { status: 200 });

  res.cookies.set("accessToken", upstream.token, {
    httpOnly: true,
    secure: isProduction || isHomolog,
    sameSite: "strict",
    maxAge: tokenLifetimeSec,
    path: "/",
  });

  res.cookies.set("refreshToken", upstream.refreshToken, {
    httpOnly: true,
    secure: isProduction || isHomolog,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/api/auth",
  });

  return res;
}
