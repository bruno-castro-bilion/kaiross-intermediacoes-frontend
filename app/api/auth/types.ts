export interface User {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  id?: string;
  email?: string;
  nomeCompleto?: string;
  fotoPerfil?: string | null;
  documento?: string | null;
  codigoPais?: string | null;
  ddd?: string | null;
  numeroTelefone?: string | null;
  status?: string;
  primeiroAcesso?: boolean;
  idTipoUsuario?: number;
  name?: string;
  avatar?: string;
  initials?: string;
  phone?: string;
  role?: UserRole;
  token?: string;
  city?: string;
  state?: string;
  address?: string;
  cep?: string;
  password?: string;
  userTypeId?: string;
  countryCode?: string;
}

export interface TipoUsuario {
  id: number;
  tipoUsuario: string;
}

export enum UserRole {
  VENDEDOR = "VENDEDOR",
  FORNECEDOR = "FORNECEDOR",
  ADMIN = "ADMIN",
  COMPRADOR = "COMPRADOR",
}

const ROLE_FROM_USER_TYPE_ID: Record<number, UserRole> = {
  1: UserRole.VENDEDOR,
  2: UserRole.FORNECEDOR,
  3: UserRole.ADMIN,
  4: UserRole.COMPRADOR,
};

export function mapUserTypeIdToRole(userTypeId: number | string): UserRole {
  const id =
    typeof userTypeId === "string" ? parseInt(userTypeId, 10) : userTypeId;
  return ROLE_FROM_USER_TYPE_ID[id] ?? UserRole.VENDEDOR;
}

/**
 * Mapeia a string de role retornada pelo backend Java
 * (auth-service AuthResponse.role) para o enum UserRole.
 *
 * O backend usa exatamente os nomes "ADMIN" | "FORNECEDOR" | "VENDEDOR" | "COMPRADOR"
 * (com.kaiross.common.domain.Role). Caso venha algo inesperado, cai em VENDEDOR
 * pra evitar crash de UI — o middleware refaz a checagem em cada navegação.
 */
export function mapRoleStringToRole(role: string | null | undefined): UserRole {
  if (!role) return UserRole.VENDEDOR;
  const upper = role.toUpperCase();
  if (upper in UserRole) {
    return UserRole[upper as keyof typeof UserRole];
  }
  return UserRole.VENDEDOR;
}

const USER_TYPE_ID_FROM_ROLE: Record<UserRole, number> = {
  [UserRole.VENDEDOR]: 1,
  [UserRole.FORNECEDOR]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.COMPRADOR]: 4,
};

export function roleToUserTypeId(role: UserRole): number {
  return USER_TYPE_ID_FROM_ROLE[role];
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  BLOCKED = "blocked",
}

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

/**
 * Resposta canônica do auth-service Java (AuthResponse).
 * Os campos *_token / nomeCompleto / idTipoUsuario do legado não existem
 * mais — quem precisar do nome do usuário deve consultar GET /api/usuarios/me.
 *
 * `refreshToken` vem em texto puro APENAS no body de login/registrar/refresh
 * (entrega única); persiste no BFF como cookie httpOnly e nunca chega ao JS
 * do navegador. O backend guarda só o hash SHA-256.
 */
export interface JavaAuthResponse {
  token: string;
  refreshToken: string;
  usuarioId: string;
  email: string;
  role: string;
}

/** Shape legado mantido para os mocks de dev — DO NOT add new usages. */
export interface LoginResponse {
  id: string;
  nomeCompleto: string;
  idTipoUsuario: TipoUsuario | number;
  fotoPerfil: string | null;
  codigoPais: string | null;
  email: string;
  access_token: string;
  refresh_token?: string;
  primeiroAcesso?: boolean;
}

export interface NextLoginResponse {
  user: User;
  accessToken?: string;
  message?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  phone?: string;
  cpfCnpj?: string;
  /** Default VENDEDOR no BFF se não for informado. */
  role?: UserRole;
}

export interface NextSignupResponse {
  message: string;
  email: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export interface ResetPassword {
  email: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}

export interface UpdatePassword {
  token: string;
  senha: string;
}

export interface ConfirmEmailResponse {
  success: boolean;
  message?: string;
}

export interface ResendConfirmationResponse {
  success: boolean;
  message?: string;
}
