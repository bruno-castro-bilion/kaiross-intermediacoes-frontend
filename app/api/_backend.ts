import axios from "axios";

const backend = axios.create({
  baseURL: process.env.API_URL ?? "",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.API_KEY ?? "",
  },
});

export default backend;
