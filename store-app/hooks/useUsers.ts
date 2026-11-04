"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  UserFilters,
  CreateUserInput,
  UpdateUserInput,
} from "@/services/userService";

export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (filters?: UserFilters) => [...USER_KEYS.lists(), filters] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
};

export function useUsers(filters?: UserFilters) {
  const queryClient = useQueryClient();

  // Query: Listado de usuarios
  const usersQuery = useQuery({
    queryKey: USER_KEYS.list(filters),
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 1000 * 30, // 30 segundos
  });

  // Mutación: Crear usuario
  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });

  // Mutación: Actualizar usuario
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
    },
  });

  // Mutación: Dar de baja usuario
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });

  return {
    users: usersQuery.data?.users || [],
    count: usersQuery.data?.count || 0,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error ? (usersQuery.error as Error).message : null,
    refetch: usersQuery.refetch,

    // Acciones
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? (createMutation.error as Error).message : null,

    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? (updateMutation.error as Error).message : null,

    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? (deleteMutation.error as Error).message : null,
  };
}
