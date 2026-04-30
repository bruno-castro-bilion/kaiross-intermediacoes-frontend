import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { AddressData } from "@/app/api/users/address/types";

export function useGetAddressByUserId(id?: string) {
  return useQuery<AddressData | null, Error>({
    queryKey: ["users", "address", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get(`/api/users/address/user/${id}`, { withCredentials: true });
      const payload = response.data;
      if (!payload) return null;
      if (payload.data) return payload.data as AddressData;
      if (payload.address) return payload.address as AddressData;
      if (Array.isArray(payload) && payload.length > 0) return payload[0] as AddressData;
      if (typeof payload === "object" && (payload.cep || payload.rua || payload.address)) return payload as AddressData;
      return null;
    },
  });
}
