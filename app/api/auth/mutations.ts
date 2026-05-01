import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/lib/store/auth-store";
import type {
  ConfirmEmailResponse,
  LoginRequest,
  NextLoginResponse,
  NextSignupResponse,
  ResendConfirmationResponse,
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
        const axiosError = error as import("axios").AxiosError<{
          message?: string;
          error?: string;
          mensagem?: string;
        }>;
        const status = axiosError.response?.status ?? 0;
        const msg =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.mensagem ||
          "Erro inesperado. Tente novamente.";
        const err: Error & { status?: number } = new Error(msg);
        err.status = status;
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.clear();
      setUser(data.user);
    },
  });
}

export function useSignup() {
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
        const axiosError = error as import("axios").AxiosError<{
          message?: string;
          error?: string;
          mensagem?: string;
        }>;
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
    mutationFn: async (data: { password: string; token: string }) => {
      try {
        const payload: UpdatePassword = {
          token: data.token,
          senha: data.password,
        };
        const response = await axios.post<UpdatePasswordResponse>(
          `/api/auth/update-password`,
          payload,
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

export function useConfirmEmail() {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      try {
        const response = await axios.post<ConfirmEmailResponse>(
          "/api/auth/confirm-email",
          { token: data.token },
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

export function useResendConfirmation() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      try {
        const response = await axios.post<ResendConfirmationResponse>(
          "/api/auth/resend-confirmation",
          { email: data.email },
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
