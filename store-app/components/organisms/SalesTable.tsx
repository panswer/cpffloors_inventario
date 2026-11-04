import React from "react";
import { SaleRecord } from "@/services/saleService";
import { Badge, Button } from "../atoms";

interface SalesTableProps {
  sales: SaleRecord[];
  isLoading: boolean;
  onViewDetails: (sale: SaleRecord) => void;
  onCancelSale: (sale: SaleRecord) => void;
  canCancel: boolean;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  isLoading,
  onViewDetails,
  onCancelSale,
  canCancel,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Cargando ventas...</span>
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          No se encontraron ventas registradas o que coincidan con la búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
        <thead className="bg-zinc-50 font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
          <tr>
            <th className="px-6 py-3.5">N° Venta / Fecha</th>
            <th className="px-6 py-3.5">Entrega A / Dirección</th>
            <th className="px-6 py-3.5">Método de Pago</th>
            <th className="px-6 py-3.5">Total</th>
            <th className="px-6 py-3.5">Estado</th>
            <th className="px-6 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sales.map((s) => (
            <tr key={s._id} className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {s.saleNumber}
                </span>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {s.recipientName}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                  {s.deliveryAddress}
                </div>
              </td>

              <td className="px-6 py-4 capitalize text-zinc-700 dark:text-zinc-300">
                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800 dark:text-zinc-300">
                  {s.paymentMethod}
                </span>
              </td>

              <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                ${s.total.toFixed(2)}
              </td>

              <td className="px-6 py-4">
                <Badge variant={s.status === "completada" ? "success" : "danger"}>
                  {s.status === "completada" ? "Completada" : "Anulada"}
                </Badge>
              </td>

              <td className="px-6 py-4 text-right">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
