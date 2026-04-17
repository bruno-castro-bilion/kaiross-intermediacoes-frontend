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
  name?: string;
  avatar?: string;
  initials?: string;
  phone?: string;
  token?: string;
  city?: string;
  state?: string;
  address?: string;
  cep?: string;
  password?: string;
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

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
