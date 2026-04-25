import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

const isProduction = process.env.NODE_ENV === "production";
const isHomolog =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token não encontrado" },
        { status: 401 },
      );
    }

    const response = await axios.post(
      `${process.env.API_URL}/auth/refreshToken`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );

    const { access_token: accessToken, refresh_token: newRefreshToken } =
      response.data;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Backend não retornou token válido" },
        { status: 500 },
      );
    }

    let tokenInfo: Record<string, unknown> = {};
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split(".")[1], "base64").toString(),
      );
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;

      tokenInfo = {
        expiresAt: expiresAt?.toISOString() || null,
        issuedAt: issuedAt?.toISOString() || null,
      };

      if (payload.idTipoUsuario) {
        const { mapUserTypeIdToRole } = await import("../types");
        tokenInfo._role = mapUserTypeIdToRole(payload.idTipoUsuario);
      }
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
    }

    const role = tokenInfo._role as string | undefined;
    const { _role: _r, ...tokenInfoClean } = tokenInfo;
    void _r;

    const res = NextResponse.json(
      { success: true, expiresIn: 5400, refreshedAt: new Date().toISOString(), ...tokenInfoClean },
      { status: 200 },
    );

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction || isHomolog,
      sameSite: "strict",
      maxAge: 5400,
      path: "/",
    });

    if (role) {
      res.cookies.set("userRole", role, {
        httpOnly: false,
        secure: isProduction || isHomolog || true,
        sameSite: isHomolog ? "none" : "strict",
        maxAge: 5400,
        path: "/",
      });
    }

    if (newRefreshToken) {
      res.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: isProduction || isHomolog,
        sameSite: "strict",
        maxAge: 7 * 24 * 3600,
        path: "/",
      });
    }

    return res;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const status = axiosError.response?.status || 500;
    const responseData = axiosError.response?.data as
      | { message?: string; error?: string }
      | undefined;

    const genericMessage =
      "Sistema temporariamente indisponível. Tente novamente mais tarde.";
    const errorMessage =
      status === 500
        ? genericMessage
        : responseData?.message ||
          responseData?.error ||
          "Erro ao renovar token. Faça login novamente.";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
