import axios from "axios";

const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.API_KEY ?? "",
  },
};

// Em prod, todos os services ficam atrás do mesmo API Gateway, então API_URL
// sozinho resolve tudo e os *_API_URL ficam vazios. Em dev (docker-compose),
// cada microservice escuta numa porta própria — defina *_API_URL no .env.local
// para o BFF rotear corretamente.
const backend = axios.create({
  ...commonConfig,
  baseURL: process.env.API_URL ?? "",
});

export const produtosBackend = axios.create({
  ...commonConfig,
  baseURL: process.env.PRODUTOS_API_URL ?? process.env.API_URL ?? "",
});

export const sellerProdutosBackend = axios.create({
  ...commonConfig,
  baseURL: process.env.SELLER_PRODUTOS_API_URL ?? process.env.API_URL ?? "",
});

export const vendasBackend = axios.create({
  ...commonConfig,
  baseURL: process.env.VENDAS_API_URL ?? process.env.API_URL ?? "",
});

export default backend;
