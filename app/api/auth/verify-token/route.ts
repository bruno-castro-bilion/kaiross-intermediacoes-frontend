import { NextRequest, NextResponse } from "next/server";

// O auth-service Java assina o JWT com RSA. A fonte de verdade é o backend
// (qualquer chamada com token inválido recebe 401). Aqui só decodificamos
// o payload pra UI saber quanto tempo falta para expirar — não validamos
// assinatura. Se quisermos validação real, importar a chave pública via
// JWT_PUBLIC_KEY (PEM) e usar `jsonwebtoken` com algorithms: ["RS256"].
function decodeJwtPayload(
  token: string,
): { exp?: number; iat?: number; role?: string; sub?: string } | null {
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

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Token não encontrado" },
      { status: 401 },
    );
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    return NextResponse.json(
      { error: "Token malformado" },
      { status: 401 },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp ? payload.exp <= now : false;
  if (isExpired) {
    return NextResponse.json(
      { error: "Token expirado" },
      { status: 401 },
    );
  }

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
    // Mantido apenas pra retrocompat com chamadas que esperavam essa flag.
    // O backend Java não emite refresh_token, então sempre `false`.
    hasRefreshToken: false,
  });
}
