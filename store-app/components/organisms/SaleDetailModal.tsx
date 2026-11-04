import React from "react";
import { SaleRecord } from "@/services/saleService";
import { Badge, Button } from "../atoms";

interface SaleDetailModalProps {
  sale: SaleRecord | null;
  onClose: () => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {sale.saleNumber}
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Detalle del Pedido
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
            <div>
              <span className="text-zinc-400 block">Entregar a:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                {sale.recipientName}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Estado:</span>
              <Badge variant={sale.status === "completada" ? "success" : "danger"}>
                {sale.status === "completada" ? "Completada" : "Anulada"}
              </Badge>
            </div>
            <div className="col-span-2">
              <span className="text-zinc-400 block">Dirección de Entrega:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {sale.deliveryAddress}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Método de Pago:</span>
              <span className="capitalize font-medium text-zinc-800 dark:text-zinc-200">
                {sale.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Fecha:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {new Date(sale.createdAt).toLocaleString()}
              </span>
            </div>
            {sale.notes && (
              <div className="col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-400 block">Instrucciones / Notas:</span>
                <span className="italic text-zinc-600 dark:text-zinc-300">
                  {sale.notes}
                </span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Productos
            </h4>
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">SKU / Producto</th>
                    <th className="px-3 py-2 text-right">Cant.</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {sale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400">
                          {item.sku}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-3 py-2 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2 text-right">
            <div>
              <span className="text-xs text-zinc-500 block">Total Pagado</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ${sale.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
