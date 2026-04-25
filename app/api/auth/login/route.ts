import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { LoginResponse, User, TipoUsuario } from "../types";
import { mapUserTypeIdToRole } from "../types";

const isProduction = process.env.NODE_ENV === "production";
const isHomolog =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas de login. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();

    const loginData = {
      email: body.email,
      senha: body.password || body.senha,
    };

    const response = await axios.post<LoginResponse>(
      `${process.env.API_URL}/auth/login`,
      loginData,
    );

    const authData = response.data;

    const tipoUsuarioValue =
      typeof authData.idTipoUsuario === "object" &&
      authData.idTipoUsuario !== null
        ? (authData.idTipoUsuario as TipoUsuario).id
        : (authData.idTipoUsuario as number);

    const user: User = {
      id: authData.id,
      name: authData.nomeCompleto,
      email: authData.email,
      primeiroAcesso: authData.primeiroAcesso,
      userTypeId: String(tipoUsuarioValue),
      role: mapUserTypeIdToRole(tipoUsuarioValue),
      avatar: authData.fotoPerfil || undefined,
      countryCode: authData.codigoPais || undefined,
      initials: authData.nomeCompleto
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };

    const res = NextResponse.json({ user }, { status: 200 });

    res.cookies.set("accessToken", authData.access_token, {
      httpOnly: true,
      secure: isProduction || isHomolog,
      sameSite: "strict",
      maxAge: 5400,
      path: "/",
    });

    res.cookies.set("userRole", user.role ?? "", {
      httpOnly: false,
      secure: isProduction || isHomolog || true,
      sameSite: isHomolog ? "none" : "strict",
      maxAge: 5400,
      path: "/",
    });

    if (authData.refresh_token) {
      res.cookies.set("refreshToken", authData.refresh_token, {
        httpOnly: true,
        secure: isProduction || isHomolog,
        sameSite: "strict",
        maxAge: 7 * 24 * 3600,
        path: "/",
      });
    }

    return res;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      mensagem?: string;
    }>;

    const status = axiosError.response?.status || 500;
    const responseData = axiosError.response?.data as
      | { message?: string; error?: string; mensagem?: string }
      | undefined;

    const genericMessage =
      "Sistema temporariamente indisponível. Tente novamente mais tarde.";

    const errorMessage =
      status === 500
        ? genericMessage
        : responseData?.message ||
          responseData?.mensagem ||
          responseData?.error ||
          "Erro ao fazer login. Verifique suas credenciais.";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
