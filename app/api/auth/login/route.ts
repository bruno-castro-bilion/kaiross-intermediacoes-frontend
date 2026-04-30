import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { JavaAuthResponse, User } from "../types";
import { mapRoleStringToRole, roleToUserTypeId, UserRole } from "../types";

// Convenção: API_URL = base do backend Java incluindo "/api"
//   dev local (auth-service direto):  http://localhost:8080/api
//   prod (ALB único da Kaiross):       https://api.kaiross.com.br/api
const API_URL = process.env.API_URL ?? "";
const isProduction = process.env.NODE_ENV === "production";
const isHomolog =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";

// JWT do backend é RSA — aqui não validamos assinatura (a fonte de verdade
// é o backend que rejeita JWT inválido). Só decodificamos para extrair `exp`
// e ajustar o maxAge dos cookies em sintonia com o token emitido.
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

function buildInitials(text: string): string {
  return text
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Mocks só carregados fora de produção, e somente quando o backend não
// responde — o objetivo é destravar UI de dev sem auth real.
const DEV_MOCK_USERS: Record<
  string,
  { senha: string; usuarioId: string; role: UserRole; nome: string }
> = isProduction
  ? {}
  : {
      "admin@kaiross.com": {
        senha: "123456",
        usuarioId: "00000000-0000-0000-0000-00000000ad01",
        role: UserRole.ADMIN,
        nome: "Admin Kaiross",
      },
      "vendedor@kaiross.com": {
        senha: "123456",
        usuarioId: "00000000-0000-0000-0000-000000000001",
        role: UserRole.VENDEDOR,
        nome: "Vendedor Kaiross",
      },
      "fornecedor@kaiross.com": {
        senha: "123456",
        usuarioId: "00000000-0000-0000-0000-000000000002",
        role: UserRole.FORNECEDOR,
        nome: "Fornecedor Kaiross",
      },
    };

function buildDevMockJwt(payload: Record<string, unknown>): string {
  const b64 = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  const header = b64({ alg: "none", typ: "JWT" });
  const body = b64(payload);
  return `${header}.${body}.dev-mock-signature`;
}

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

interface LoginUpstream {
  token: string;
  refreshToken?: string;
  usuarioId: string;
  email: string;
  role: UserRole;
  nome?: string;
}

async function callJavaLogin(
  email: string,
  senha: string,
): Promise<LoginUpstream> {
  const response = await axios.post<JavaAuthResponse>(
    `${API_URL}/auth/login`,
    { email, senha },
    { headers: { "Content-Type": "application/json" } },
  );
  return {
    token: response.data.token,
    refreshToken: response.data.refreshToken,
    usuarioId: response.data.usuarioId,
    email: response.data.email,
    role: mapRoleStringToRole(response.data.role),
  };
}

// Best-effort enrichment: pega o nome do usuário em /api/usuarios/me usando
// o JWT recém-emitido. Se usuarios-service estiver fora do ar / API_URL
// não rotear pra ele em dev, login segue funcionando sem o nome.
async function fetchNomeUsuario(token: string): Promise<string | undefined> {
  try {
    const r = await axios.get<{ nome?: string }>(`${API_URL}/usuarios/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 3000,
    });
    return r.data?.nome ?? undefined;
  } catch {
    return undefined;
  }
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

  let body: { email?: string; password?: string; senha?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const senha = body.password ?? body.senha ?? "";

  if (!email || !senha) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios." },
      { status: 400 },
    );
  }

  let upstream: LoginUpstream;
  try {
    upstream = await callJavaLogin(email, senha);
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      mensagem?: string;
    }>;

    const status = axiosError.response?.status ?? 0;
    const responseData = axiosError.response?.data;

    // Fallback dev-only: se o backend está fora do ar (sem resposta) ou
    // retornou 5xx, e o usuário é um dos mocks de dev, autoriza com JWT
    // assinado localmente (apenas para desbloquear UI sem backend rodando).
    const mock = DEV_MOCK_USERS[email];
    const backendUnavailable = !axiosError.response || status >= 500;
    if (mock && backendUnavailable && mock.senha === senha) {
      const nowSec = Math.floor(Date.now() / 1000);
      const token = buildDevMockJwt({
        sub: mock.usuarioId,
        email,
        role: mock.role,
        iat: nowSec,
        exp: nowSec + 5400,
      });
      upstream = {
        token,
        usuarioId: mock.usuarioId,
        email,
        role: mock.role,
        nome: mock.nome,
      };
    } else {
      const genericMessage =
        "Sistema temporariamente indisponível. Tente novamente mais tarde.";
      const errorMessage =
        status === 0 || status >= 500
          ? genericMessage
          : responseData?.message ||
            responseData?.mensagem ||
            responseData?.error ||
            "Credenciais inválidas.";
      return NextResponse.json(
        { error: errorMessage },
        { status: status === 0 ? 503 : status },
      );
    }
  }

  // Tenta enriquecer com o nome (não bloqueia se falhar).
  if (!upstream.nome) {
    upstream.nome = await fetchNomeUsuario(upstream.token);
  }

  const displayName = upstream.nome ?? upstream.email;
  const user: User = {
    id: upstream.usuarioId,
    email: upstream.email,
    name: upstream.nome,
    nomeCompleto: upstream.nome,
    role: upstream.role,
    userTypeId: String(roleToUserTypeId(upstream.role)),
    idTipoUsuario: roleToUserTypeId(upstream.role),
    initials: buildInitials(displayName),
  };

  // Alinha o maxAge do cookie com o `exp` do JWT — evita o caso em que o
  // cookie ainda existe mas o backend já rejeita o token.
  const payload = decodeJwtPayload(upstream.token);
  const nowSec = Math.floor(Date.now() / 1000);
  const tokenLifetimeSec =
    payload?.exp && payload.exp > nowSec ? payload.exp - nowSec : 5400;

  const res = NextResponse.json({ user }, { status: 200 });

  res.cookies.set("accessToken", upstream.token, {
    httpOnly: true,
    secure: isProduction || isHomolog,
    sameSite: "strict",
    maxAge: tokenLifetimeSec,
    path: "/",
  });

  // Refresh token vive ~7 dias por padrão no backend; cookie alinhado.
  // Path restrito a /api/auth pra reduzir exposição (só refresh/logout leem).
  if (upstream.refreshToken) {
    res.cookies.set("refreshToken", upstream.refreshToken, {
      httpOnly: true,
      secure: isProduction || isHomolog,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth",
    });
  }

  res.cookies.set("userRole", user.role ?? "", {
    httpOnly: false,
    secure: isProduction || isHomolog,
    sameSite: isHomolog ? "lax" : "strict",
    maxAge: tokenLifetimeSec,
    path: "/",
  });

  return res;
}
