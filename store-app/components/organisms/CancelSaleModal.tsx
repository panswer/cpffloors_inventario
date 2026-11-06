"use client";

import React, { useState } from "react";
import { SaleRecord } from "@/services/saleService";
import { Button } from "../atoms";

interface CancelSaleModalProps {
  isOpen: boolean;
  sale: SaleRecord | null;
  onClose: () => void;
  onConfirm: (saleId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const CancelSaleModal: React.FC<CancelSaleModalProps> = ({
  isOpen,
  sale,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !sale) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onConfirm(sale._id, reason.trim());
      setReason("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al anular la venta");
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 my-8">
        {/* Encabezado con Icono de Advertencia */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Anular Venta / Pedido
            </h2>
            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
              {sale.saleNumber}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="font-semibold mb-1">⚠️ Acción con impacto en inventario:</p>
            <p>
              Al anular este pedido, el stock de todos los productos será devuelto y repuesto automáticamente al catálogo de inventario.
            </p>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-zinc-400 font-medium">Destinatario: </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {sale.recipientName}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-medium">Total: </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                ${sale.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="cancel-reason"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Motivo de la anulación (opcional)
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ej. Pedido duplicado, cliente canceló la compra por tiempo de entrega..."
              className="block w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Anulando..." : "Confirmar Anulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
