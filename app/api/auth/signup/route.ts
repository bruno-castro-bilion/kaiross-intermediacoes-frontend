import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import type { SignupResponse, User, TipoUsuario } from "../types";
import { mapUserTypeIdToRole } from "../types";

const isProduction = process.env.NODE_ENV === "production";
const isHomolog =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const signupData = {
      nomeCompleto: body.name,
      email: body.email,
      senha: body.password,
    };

    const response = await axios.post<SignupResponse>(
      `${process.env.API_URL}/users`,
      signupData,
    );

    const authData = response.data;

    const tipoUsuarioValue =
      typeof authData.idTipoUsuario === "object" &&
      authData.idTipoUsuario !== null
        ? (authData.idTipoUsuario as TipoUsuario).id
        : (authData.idTipoUsuario as number);

    const user: User = {
      id: authData.id.toString(),
      name: authData.nomeCompleto,
      email: authData.email,
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

    const res = NextResponse.json(
      { user, message: "Conta criada com sucesso!" },
      { status: 201 },
    );

    res.cookies.set("accessToken", authData.token, {
      httpOnly: true,
      secure: isProduction || isHomolog,
      sameSite: "strict",
      maxAge: 5400,
      path: "/",
    });

    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status || 500;
      const responseData = error.response?.data as
        | { message?: string; error?: string }
        | undefined;

      const serverMessage = responseData?.message || responseData?.error;

      if (
        statusCode === 409 ||
        (serverMessage && serverMessage.includes("já existe"))
      ) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 409 },
        );
      }

      if (statusCode === 400) {
        return NextResponse.json(
          { error: serverMessage || "Erro ao criar conta", details: responseData },
          { status: 400 },
        );
      }

      const genericMessage =
        "Sistema temporariamente indisponível. Tente novamente mais tarde.";
      const errorMessage =
        statusCode === 500 ? genericMessage : serverMessage || "Erro ao criar conta";

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    return NextResponse.json(
      { error: "Sistema temporariamente indisponível. Tente novamente mais tarde." },
      { status: 500 },
    );
  }
}
