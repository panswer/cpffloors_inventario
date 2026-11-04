import React from "react";
import { ProductItem } from "@/services/productService";
import { Badge, Button } from "../atoms";

interface ProductsTableProps {
  products: ProductItem[];
  isLoading: boolean;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  canManage: boolean;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
  canManage,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          No se encontraron productos registrados o que coincidan con la búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
        <thead className="bg-zinc-50 font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
          <tr>
            <th className="px-6 py-3.5">SKU / Producto</th>
            <th className="px-6 py-3.5">Categoría</th>
            <th className="px-6 py-3.5">Precio</th>
            <th className="px-6 py-3.5">Stock</th>
            <th className="px-6 py-3.5">Estado</th>
            {canManage && <th className="px-6 py-3.5 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {products.map((p) => (
            <tr key={p._id} className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {p.sku}
                  </span>
                </div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {p.name}
                </div>
                {p.description && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                    {p.description}
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {p.category}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ${p.price.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  por {p.unit}
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {p.stock} {p.unit}
                </span>
              </td>

              <td className="px-6 py-4">
                <Badge variant={p.isActive ? "success" : "danger"}>
                  {p.isActive ? "Activo" : "Baja"}
                </Badge>
              </td>

              {canManage && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      className="!py-1 !px-2.5 text-xs"
                      onClick={() => onEdit(p)}
                    >
                      Editar
                    </Button>
                    {p.isActive && (
                      <button
                        onClick={() => onDelete(p)}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        Dar de Baja
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
