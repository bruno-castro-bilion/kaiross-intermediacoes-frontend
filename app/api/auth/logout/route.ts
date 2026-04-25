import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("userRole");

    return NextResponse.json(
      { message: "Logout realizado com sucesso" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Sistema temporariamente indisponível. Tente novamente mais tarde." },
      { status: 200 },
    );
  }
}
