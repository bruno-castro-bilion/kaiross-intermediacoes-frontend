import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/lib/store/auth-store";
import type { User, ApiResponse } from "../auth/types";

export function useUpdateUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<User> }) => {
      const response = await axios.patch<ApiResponse<User>>(`/api/users/${params.id}`, params.data, { withCredentials: true });
      return response.data;
    },
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", params.id] });
      if (data?.data && currentUser && data.data.id === currentUser.id) {
        setUser(data.data as User);
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete<ApiResponse<null>>(`/api/users/${id}`, { withCredentials: true });
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
}
