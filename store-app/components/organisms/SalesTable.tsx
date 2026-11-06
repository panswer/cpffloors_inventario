import React from "react";
import { SaleRecord } from "@/services/saleService";
import { Badge, Button } from "../atoms";
import { Table, Column, PaginationConfig } from "../molecules";

interface SalesTableProps {
  sales: SaleRecord[];
  isLoading: boolean;
  onViewDetails: (sale: SaleRecord) => void;
  onCancelSale: (sale: SaleRecord) => void;
  canCancel: boolean;
  pagination?: boolean | PaginationConfig;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  isLoading,
  onViewDetails,
  onCancelSale,
  canCancel,
  pagination = true,
}) => {
  const columns: Column<SaleRecord>[] = [
    {
      header: "N° Venta / Fecha",
      render: (s) => (
        <div>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
            {s.saleNumber}
          </span>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {new Date(s.createdAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: "Entrega A / Dirección",
      render: (s) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            {s.recipientName}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
            {s.deliveryAddress}
          </div>
        </div>
      ),
    },
    {
      header: "Método de Pago",
      render: (s) => (
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium capitalize dark:bg-zinc-800 dark:text-zinc-300">
          {s.paymentMethod}
        </span>
      ),
    },
    {
      header: "Total",
      render: (s) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-100">
          ${s.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (s) => (
        <Badge variant={s.status === "completada" ? "success" : "danger"}>
          {s.status === "completada" ? "Completada" : "Anulada"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="!py-1 !px-2.5 text-xs"
            onClick={() => onViewDetails(s)}
          >
            Detalle
          </Button>
          {s.status === "completada" && canCancel && (
            <button
              onClick={() => onCancelSale(s)}
              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Anular
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      data={sales}
      columns={columns}
      keyExtractor={(s) => s._id}
      isLoading={isLoading}
      loadingMessage="Cargando ventas..."
      emptyMessage="No se encontraron ventas registradas o que coincidan con la búsqueda."
      pagination={pagination}
    />
  );
};
