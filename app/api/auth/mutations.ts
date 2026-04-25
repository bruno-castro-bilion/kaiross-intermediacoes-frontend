import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/lib/store/auth-store";
import type {
  LoginRequest,
  NextLoginResponse,
  NextSignupResponse,
  ResetPassword,
  ResetPasswordResponse,
  SignupRequest,
  UpdatePassword,
  UpdatePasswordResponse,
} from "./types";

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      try {
        const loginData: LoginRequest = {
          email: data.email,
          senha: data.password,
        };
        const response = await axios.post<NextLoginResponse>(
          "/api/auth/login",
          loginData,
          { withCredentials: true },
        );
        return response.data;
      } catch (error) {
        const axiosError = error as import("axios").AxiosError<{ message?: string; error?: string; mensagem?: string }>;
        const msg =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.mensagem ||
          "Erro inesperado. Tente novamente.";
        throw new Error(msg);
      }
    },
    onSuccess: (data) => {
      queryClient.clear();
      setUser(data.user);
    },
  });
}

export function useSignup() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      try {
        const response = await axios.post<NextSignupResponse>(
          "/api/auth/signup",
          data,
          { withCredentials: true },
        );
        return response.data;
      } catch (error) {
        const axiosError = error as import("axios").AxiosError<{ message?: string; error?: string; mensagem?: string }>;
        const msg =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.mensagem ||
          "Erro inesperado. Tente novamente.";
        throw new Error(msg);
      }
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await axios.post("/api/auth/logout", {}, { withCredentials: true });
      } catch (error) {
        const axiosError = error as import("axios").AxiosError<{ message?: string; error?: string; mensagem?: string }>;
        const msg =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.mensagem ||
          "Erro inesperado. Tente novamente.";
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      try {
        const resetData: ResetPassword = { email: data.email };
        const response = await axios.post<ResetPasswordResponse>(
          "/api/auth/reset-password",
          resetData,
          { withCredentials: true },
        );
        return response.data;
      } catch (error) {
        const axiosError = error as import("axios").AxiosError<{ message?: string; error?: string; mensagem?: string }>;
        const msg =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.mensagem ||
          "Erro inesperado. Tente novamente.";
        throw new Error(msg);
      }
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: { password: string; token?: string }) => {
      try {
        const updatePasswordData: UpdatePassword = { senha: data.password };
        const response = await axios.patch<UpdatePasswordResponse>(
          `/api/auth/update-password`,
          updatePasswordData,
          {
            withCredentials: true,
            headers: data.token
              ? { Authorization: `Bearer ${data.token}` }
              : undefined,
          },
        );
        return response.data;
      } catch (error) {
        const axiosError = error as import("axios").AxiosError<{ message?: string; error?: string; mensagem?: string }>;
        const msg =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.mensagem ||
          "Erro inesperado. Tente novamente.";
        throw new Error(msg);
      }
    },
  });
}
