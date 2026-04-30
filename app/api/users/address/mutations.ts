import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Address, AddressData } from "@/app/api/users/address/types";

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<Address> | Partial<AddressData> }) => {
      const response = await axios.post(`/api/users/address`, params.data, { withCredentials: true });
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["users", "address", vars.id] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { addressId: string; data: Partial<Address> | Partial<AddressData> }) => {
      const response = await axios.patch(`/api/users/address/${params.addressId}`, params.data, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "address"] });
    },
  });
}
