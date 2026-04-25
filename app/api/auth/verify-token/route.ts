import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token não encontrado" },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Configuração inválida" },
        { status: 500 },
      );
    }

    const payload = jwt.verify(accessToken, secret) as jwt.JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = payload.exp ? payload.exp - now : null;

    return NextResponse.json({
      token: {
        expiresAt: payload.exp
          ? new Date(payload.exp * 1000).toISOString()
          : null,
        isExpired: false,
        timeUntilExpiration,
        timeUntilExpirationMinutes: timeUntilExpiration
          ? Math.floor(timeUntilExpiration / 60)
          : null,
      },
      hasRefreshToken: !!refreshToken,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Erro ao verificar token" },
      { status: 500 },
    );
  }
}
