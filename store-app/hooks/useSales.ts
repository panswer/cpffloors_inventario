"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  salesApi,
  SaleFilters,
  CreateSaleInput,
} from "@/services/saleService";
import { PRODUCT_KEYS } from "./useProducts";
import { CLIENT_KEYS } from "./useClients";

export const SALE_KEYS = {
  all: ["sales"] as const,
  lists: () => [...SALE_KEYS.all, "list"] as const,
  list: (filters?: SaleFilters) => [...SALE_KEYS.lists(), filters] as const,
  details: () => [...SALE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SALE_KEYS.details(), id] as const,
};

export function useSales(filters?: SaleFilters) {
  const queryClient = useQueryClient();

  // Query: Listar ventas
  const salesQuery = useQuery({
    queryKey: SALE_KEYS.list(filters),
    queryFn: () => salesApi.getSales(filters),
    staleTime: 1000 * 30, // 30 segundos
  });

  // Mutación: Registrar nueva venta
  const createMutation = useMutation({
    mutationFn: (data: CreateSaleInput) => salesApi.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() });
      // Invalida inventario porque se consumió stock
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
      // Invalida clientes por si se creó un cliente nuevo durante la venta
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.lists() });
    },
  });

  // Mutación: Anular venta
  const cancelMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      salesApi.cancelSale(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(variables.id) });
      // Invalida inventario porque se devolvió el stock
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });

  return {
    sales: salesQuery.data?.sales || [],
    count: salesQuery.data?.count || 0,
    isLoading: salesQuery.isLoading,
    isError: salesQuery.isError,
    error: salesQuery.error ? (salesQuery.error as Error).message : null,
    refetch: salesQuery.refetch,

    // Acciones
    createSale: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? (createMutation.error as Error).message : null,

    cancelSale: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error ? (cancelMutation.error as Error).message : null,
  };
}

// Hook para consultar el detalle completo de una venta bajo demanda (incluyendo items)
export function useSaleDetail(id: string | null) {
  return useQuery({
    queryKey: SALE_KEYS.detail(id || ""),
    queryFn: () => salesApi.getSaleById(id!),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minuto
  });
}

