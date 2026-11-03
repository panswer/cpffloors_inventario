"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, LoginCredentials } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, clearSession } = useAuthStore();

  // Query para obtener el usuario autenticado
  const meQuery = useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        setUser(response.user);
        return response.user;
      } catch (err) {
        clearSession();
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutación para login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(AUTH_KEYS.me, data.user);
      router.push("/");
      router.refresh();
    },
  });

  // Mutación para logout
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearSession();
      queryClient.removeQueries({ queryKey: AUTH_KEYS.me });
      router.push("/login");
      router.refresh();
    },
  });

  return {
    user: user || meQuery.data || null,
    isAuthenticated: isAuthenticated || !!meQuery.data,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? (loginMutation.error as Error).message : null,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
