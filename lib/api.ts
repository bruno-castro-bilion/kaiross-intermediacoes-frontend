import axios from "axios";

/**
 * Cliente HTTP padrão para chamadas client-side.
 *
 * Aponta para o BFF Next ("/api/..."), não para o backend Java diretamente.
 * Autenticação flui via cookie httpOnly `accessToken` que o BFF injeta como
 * Authorization: Bearer ao chamar o backend — portanto basta `withCredentials`.
 *
 * Calls server-side (route handlers, server components) devem usar `axios`
 * direto com `process.env.API_URL` e o token do cookie já está disponível
 * via `request.cookies.get("accessToken")`.
 */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
