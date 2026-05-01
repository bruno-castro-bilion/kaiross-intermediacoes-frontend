/**
 * Lookup de CEP via BrasilAPI v2 — consulta Correios + WideNet + OpenCEP em
 * cascata, então sobrevive quando uma fonte cai. Sem auth, sem rate limit
 * relevante.
 *
 * Doc: https://brasilapi.com.br/docs#tag/CEP-V2
 */
export interface CepLookupResult {
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  endereco: string;
}

const BRASILAPI_CEP = "https://brasilapi.com.br/api/cep/v2";

export async function lookupCep(cep: string): Promise<CepLookupResult> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    throw new Error("CEP inválido");
  }

  const response = await fetch(`${BRASILAPI_CEP}/${digits}`, {
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    throw new Error("CEP não encontrado");
  }
  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP agora");
  }

  const data = (await response.json()) as {
    cep: string;
    state?: string;
    city?: string;
    neighborhood?: string;
    street?: string;
  };

  return {
    cep: data.cep,
    uf: data.state ?? "",
    cidade: data.city ?? "",
    bairro: data.neighborhood ?? "",
    endereco: data.street ?? "",
  };
}
