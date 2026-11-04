import React from "react";
import { ProductItem } from "@/services/productService";
import { Badge, Button } from "../atoms";
import { Table, Column } from "../molecules";

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
  const columns: Column<ProductItem>[] = [
    {
      header: "SKU / Producto",
      render: (p) => (
        <div>
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
        </div>
      ),
    },
    {
      header: "Categoría",
      render: (p) => (
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {p.category}
        </span>
      ),
    },
    {
      header: "Precio",
      render: (p) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            ${p.price.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            por {p.unit}
          </div>
        </div>
      ),
    },
    {
      header: "Stock",
      render: (p) => (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {p.stock} {p.unit}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (p) => (
        <Badge variant={p.isActive ? "success" : "danger"}>
          {p.isActive ? "Activo" : "Baja"}
        </Badge>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => (
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
      ),
    });
  }

  return (
    <Table
      data={products}
      columns={columns}
      keyExtractor={(p) => p._id}
      isLoading={isLoading}
      loadingMessage="Cargando productos..."
      emptyMessage="No se encontraron productos registrados o que coincidan con la búsqueda."
      pagination={true}
    />
  );
};
