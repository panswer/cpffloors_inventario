"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  ClientFilters,
  CreateClientInput,
  UpdateClientInput,
} from "@/services/clientService";

export const CLIENT_KEYS = {
  all: ["clients"] as const,
  lists: () => [...CLIENT_KEYS.all, "list"] as const,
  list: (filters?: ClientFilters) => [...CLIENT_KEYS.lists(), filters] as const,
  details: () => [...CLIENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CLIENT_KEYS.details(), id] as const,
};

export function useClients(filters?: ClientFilters) {
  const queryClient = useQueryClient();

  // Query: Listar clientes
  const clientsQuery = useQuery({
    queryKey: CLIENT_KEYS.list(filters),
    queryFn: () => clientsApi.getClients(filters),
    staleTime: 1000 * 30, // 30 segundos
  });

  // Mutación: Crear cliente
  const createMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
    },
  });

  // Mutación: Actualizar cliente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
      clientsApi.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.detail(variables.id) });
    },
  });

  // Mutación: Dar de baja cliente
  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
    },
  });

  return {
    clients: clientsQuery.data?.clients || [],
    count: clientsQuery.data?.count || 0,
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    error: clientsQuery.error ? (clientsQuery.error as Error).message : null,
    refetch: clientsQuery.refetch,

    // Acciones
    createClient: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? (createMutation.error as Error).message : null,

    updateClient: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? (updateMutation.error as Error).message : null,

    deleteClient: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? (deleteMutation.error as Error).message : null,
  };
}
