export interface Address {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  cep?: number | string;
  rua?: string;
  bairro?: string;
  numero?: number | string;
  complemento?: string | null;
  cidade?: string;
  estado?: string;
  pais?: string;
  idUsuario?: Record<string, unknown> | null;
}

export type AddressData = Address;
export default Address;
