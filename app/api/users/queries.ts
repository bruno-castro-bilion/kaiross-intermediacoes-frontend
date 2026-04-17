import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "../auth/types";

export function useGetUserById(id?: string) {
  return useQuery<User | null, Error>({
    queryKey: ["user", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get(`/api/users/${id}`, { withCredentials: true });
      const payload = response.data;
      if (!payload) return null;
      if (payload.data) return payload.data as User;
      if (payload.user) return payload.user as User;
      if (typeof payload === "object" && (payload.id || payload.email)) return payload as User;
      return null;
    },
  });
}
