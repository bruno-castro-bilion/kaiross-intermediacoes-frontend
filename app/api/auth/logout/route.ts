import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_URL = process.env.API_URL ?? "";

/**
 * Revoga o refresh token no backend (best-effort) e limpa os cookies locais.
 * Mesmo se o backend falhar, devolvemos 200 e limpamos cookies — UX de logout
 * deve ser sempre bem-sucedida do ponto de vista do cliente.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (refreshToken && API_URL) {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 3000,
        },
      );
    } catch {
      // Backend pode estar fora — não bloqueia logout local.
    }
  }

  const res = NextResponse.json(
    { message: "Logout realizado com sucesso" },
    { status: 200 },
  );
  res.cookies.delete("accessToken");
  res.cookies.delete({ name: "refreshToken", path: "/api/auth" });
  res.cookies.delete("userRole");
  return res;
}
