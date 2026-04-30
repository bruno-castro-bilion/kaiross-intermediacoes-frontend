import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { JavaAuthResponse, User } from "../types";
import {
  mapRoleStringToRole,
  roleToUserTypeId,
  UserRole,
} from "../types";

const API_URL = process.env.API_URL ?? "";
const isProduction = process.env.NODE_ENV === "production";
const isHomolog =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";

function decodeJwtPayload(token: string): { exp?: number } | null {
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

const ALLOWED_SELF_SIGNUP_ROLES: ReadonlySet<UserRole> = new Set([
  UserRole.VENDEDOR,
  UserRole.FORNECEDOR,
  UserRole.COMPRADOR,
]);

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    password?: string;
    senha?: string;
    role?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const nome = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const senha = body.password ?? body.senha ?? "";

  if (!nome || !email || !senha) {
    return NextResponse.json(
      { error: "Nome, email e senha são obrigatórios." },
      { status: 400 },
    );
  }

  // Backend rejeita signup com role ADMIN; aqui aceitamos VENDEDOR/FORNECEDOR/COMPRADOR
  // e caímos em VENDEDOR como default (tela atual de signup é só pra vendedor).
  const requestedRole = body.role
    ? mapRoleStringToRole(body.role)
    : UserRole.VENDEDOR;
  const role = ALLOWED_SELF_SIGNUP_ROLES.has(requestedRole)
    ? requestedRole
    : UserRole.VENDEDOR;

  let upstream: JavaAuthResponse;
  try {
    const response = await axios.post<JavaAuthResponse>(
      `${API_URL}/auth/registrar`,
      { email, senha, role },
      { headers: { "Content-Type": "application/json", "x-api-key": process.env.API_KEY } },
    );
    upstream = response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      mensagem?: string;
    }>;
    const status = axiosError.response?.status ?? 0;
    const responseData = axiosError.response?.data;
    const serverMessage =
      responseData?.message || responseData?.mensagem || responseData?.error;

    if (
      status === 400 &&
      typeof serverMessage === "string" &&
      /j[áa] cadastrado/i.test(serverMessage)
    ) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 },
      );
    }
    if (status === 409) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 },
      );
    }
    if (status === 400) {
      return NextResponse.json(
        { error: serverMessage || "Erro ao criar conta." },
        { status: 400 },
      );
    }
    if (status === 403) {
      return NextResponse.json(
        { error: serverMessage || "Tipo de cadastro não permitido." },
        { status: 403 },
      );
    }

    const genericMessage =
      "Sistema temporariamente indisponível. Tente novamente mais tarde.";
    const errorMessage =
      status === 0 || status >= 500
        ? genericMessage
        : serverMessage || "Erro ao criar conta.";
    return NextResponse.json(
      { error: errorMessage },
      { status: status === 0 ? 503 : status },
    );
  }

  const resolvedRole = mapRoleStringToRole(upstream.role);

  // Best-effort: grava o nome digitado no perfil via PUT /api/usuarios/{id}.
  // Se falhar (usuarios-service fora do ar, API_URL só roteia auth, etc.),
  // a conta já foi criada e o usuário pode editar o nome depois pelo perfil.
  try {
    await axios.put(
      `${API_URL}/usuarios/${upstream.usuarioId}`,
      { nome },
      {
        headers: {
          Authorization: `Bearer ${upstream.token}`,
          "Content-Type": "application/json",
        },
        timeout: 3000,
      },
    );
  } catch {
    // silencioso — perfil pode ser preenchido depois
  }

  const user: User = {
    id: upstream.usuarioId,
    email: upstream.email,
    name: nome,
    nomeCompleto: nome,
    role: resolvedRole,
    userTypeId: String(roleToUserTypeId(resolvedRole)),
    idTipoUsuario: roleToUserTypeId(resolvedRole),
    initials: buildInitials(nome),
  };

  const payload = decodeJwtPayload(upstream.token);
  const nowSec = Math.floor(Date.now() / 1000);
  const tokenLifetimeSec =
    payload?.exp && payload.exp > nowSec ? payload.exp - nowSec : 5400;

  const res = NextResponse.json(
    { user, message: "Conta criada com sucesso!" },
    { status: 201 },
  );

  res.cookies.set("accessToken", upstream.token, {
    httpOnly: true,
    secure: isProduction || isHomolog,
    sameSite: "strict",
    maxAge: tokenLifetimeSec,
    path: "/",
  });

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
