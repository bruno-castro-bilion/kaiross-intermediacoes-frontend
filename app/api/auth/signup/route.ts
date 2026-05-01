import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import backend from "@/app/api/_backend";

const ROLES_PERMITIDOS = new Set(["VENDEDOR", "COMPRADOR", "FORNECEDOR"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Cadastro público: backend Java cria conta com a role recebida (default
// VENDEDOR) e dispara email de confirmação. NÃO retornamos tokens — usuário
// precisa clicar no link do email pra ativar a conta antes de logar (bloqueio
// é forçado em /api/auth/login).
//
// `clienteId` aparece quando o cadastro vem do fluxo de pos-checkout: o
// comprador anônimo virou usuário e precisa ficar vinculado ao Cliente master
// criado pelo POST /api/vendas/checkout. ADMIN é rejeitado por defesa em
// profundidade (backend também rejeita).
export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    password?: string;
    senha?: string;
    role?: string;
    clienteId?: string;
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
  const roleRaw = (body.role ?? "VENDEDOR").trim().toUpperCase();
  const clienteIdRaw = (body.clienteId ?? "").trim();

  if (!nome || !email || !senha) {
    return NextResponse.json(
      { error: "Nome, email e senha são obrigatórios." },
      { status: 400 },
    );
  }

  if (!ROLES_PERMITIDOS.has(roleRaw)) {
    return NextResponse.json(
      { error: "Tipo de cadastro não permitido." },
      { status: 400 },
    );
  }

  const clienteId = clienteIdRaw || undefined;
  if (clienteId && !UUID_RE.test(clienteId)) {
    return NextResponse.json(
      { error: "clienteId inválido." },
      { status: 400 },
    );
  }

  try {
    await backend.post(
      `auth/registrar`,
      { nome, email, senha, role: roleRaw, clienteId },
      { headers: { "x-api-key": process.env.API_KEY } },
    );
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

  return NextResponse.json(
    {
      message: "Conta criada. Verifique seu email para ativá-la.",
      email,
    },
    { status: 201 },
  );
}
