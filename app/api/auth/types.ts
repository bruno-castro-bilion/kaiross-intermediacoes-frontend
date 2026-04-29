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
}

export function mapUserTypeIdToRole(userTypeId: number | string): UserRole {
  const id =
    typeof userTypeId === "string" ? parseInt(userTypeId, 10) : userTypeId;
  switch (id) {
    case 1:
      return UserRole.VENDEDOR;
    case 2:
      return UserRole.FORNECEDOR;
    case 3:
      return UserRole.ADMIN;
    default:
      return UserRole.VENDEDOR;
  }
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
  accessToken: string;
  message?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  phone?: string;
  cpfCnpj?: string;
}

export interface SignupResponse {
  id: string;
  nomeCompleto: string;
  idTipoUsuario: TipoUsuario | number;
  fotoPerfil: string | null;
  codigoPais: string | null;
  email: string;
  token: string;
}

export interface NextSignupResponse {
  user: User;
  message: string;
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
  senha: string;
}
