"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
} from "@/services/productService";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_KEYS.all, "list"] as const,
  list: (filters?: ProductFilters) => [...PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
};

export function useProducts(filters?: ProductFilters) {
  const queryClient = useQueryClient();

  // Query: Listar productos
  const productsQuery = useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 1000 * 30, // 30 segundos
  });

  // Mutación: Crear producto
  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });

  // Mutación: Actualizar producto
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) });
    },
  });

  // Mutación: Dar de baja producto
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });

  // Mutación: Carga masiva por hoja de cálculo
  const bulkMutation = useMutation({
    mutationFn: ({ items, mode }: { items: any[]; mode?: "add" | "set" }) =>
      productsApi.importBulk(items, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });

  return {
    products: productsQuery.data?.products || [],
    count: productsQuery.data?.count || 0,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error ? (productsQuery.error as Error).message : null,
    refetch: productsQuery.refetch,

    // Acciones
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? (createMutation.error as Error).message : null,

    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? (updateMutation.error as Error).message : null,

    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? (deleteMutation.error as Error).message : null,

    importBulk: bulkMutation.mutateAsync,
    isImporting: bulkMutation.isPending,
    importError: bulkMutation.error ? (bulkMutation.error as Error).message : null,
  };
}
