"use client";

import React, { useState } from "react";
import { useSalesReport } from "@/hooks/useSales";
import { SaleReportFilter } from "@/services/saleService";
import { Button, Input, Badge } from "@/components/atoms";

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesReportModal: React.FC<SalesReportModalProps> = ({ isOpen, onClose }) => {
  // Rango de fechas por defecto: últimos 30 días
  const today = new Date().toISOString().split("T")[0];
  const priorDate = new Date();
  priorDate.setDate(priorDate.getDate() - 30);
  const thirtyDaysAgo = priorDate.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState<string>("completada");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const filters: SaleReportFilter = {
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
  };

  const { data, isLoading, isError, error } = useSalesReport(filters);

  if (!isOpen) return null;

  // Generador y descargador de archivo CSV
  const handleExportCSV = () => {
    if (!data?.sales || data.sales.length === 0) {
      alert("No hay datos de ventas disponibles para exportar con estos filtros.");
      return;
    }

    const headers = [
      "Nro Venta",
      "Fecha",
      "Estado",
      "Cliente",
      "Documento/RIF",
      "Destinatario",
      "Direccion Entrega",
      "Metodo Pago",
      "Subtotal ($)",
      "Total ($)",
      "Items",
    ];

    const rows = data.sales.map((sale) => {
      const itemsDetail = (sale.items || [])
        .map((i) => `${i.quantity}x ${i.name} [${i.sku}]`)
        .join(" | ");

      return [
        `"${sale.saleNumber}"`,
        `"${new Date(sale.createdAt).toLocaleString()}"`,
        `"${sale.status}"`,
        `"${sale.clientId?.name || "N/A"}"`,
        `"${sale.clientId?.documentId || "N/A"}"`,
        `"${sale.recipientName.replace(/"/g, '""')}"`,
        `"${sale.deliveryAddress.replace(/"/g, '""')}"`,
        `"${sale.paymentMethod}"`,
        sale.subtotal.toFixed(2),
        sale.total.toFixed(2),
        `"${itemsDetail.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_ventas_${startDate}_al_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || {
    totalSales: 0,
    completedSales: 0,
    cancelledSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Cabecera Fija */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                📊
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Reportes Analíticos de Ventas
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Métricas clave, productos más vendidos y exportación de datos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              disabled={isLoading || !data?.sales?.length}
              className="text-xs !py-1.5 !px-3 font-semibold"
            >
              📥 Exportar CSV
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Barra de Filtros */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-3">
              Filtros del Periodo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Desde
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="!py-1.5 !text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Hasta
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="!py-1.5 !text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Todos</option>
                  <option value="completada">Completadas</option>
                  <option value="anulada">Anuladas</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Método Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-xs text-zinc-500">Calculando métricas del periodo...</p>
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error ? (error as Error).message : "Error al cargar reporte"}
            </div>
          ) : (
            <>
              {/* Tarjetas KPI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Ingresos Totales
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Ventas completadas
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Ticket Promedio
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    ${summary.averageTicket.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Por pedido completado</span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Pedidos Completados
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {summary.completedSales}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    de {summary.totalSales} registrados
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Anulaciones
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
                    {summary.cancelledSales}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Stock reintegrado
                  </span>
                </div>
              </div>

              {/* Secciones en 2 columnas: Top Productos y Desglose de Pago */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Productos */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
                    🏆 Top 10 Productos Más Vendidos
                  </h3>

                  {data?.topProducts && data.topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs divide-y divide-zinc-200 dark:divide-zinc-700">
                        <thead className="text-zinc-400 font-semibold">
                          <tr>
                            <th className="text-left pb-2">Producto</th>
                            <th className="text-right pb-2">Cant.</th>
                            <th className="text-right pb-2">Ingresos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {data.topProducts.map((p) => (
                            <tr key={p.productId}>
                              <td className="py-2 pr-2 font-medium">
                                <div className="truncate max-w-[180px]">{p.name}</div>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {p.sku}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-zinc-700 dark:text-zinc-300">
                                {p.totalQuantity} {p.unit}
                              </td>
                              <td className="py-2 pl-2 text-right font-semibold text-blue-600 dark:text-blue-400">
                                ${p.totalRevenue.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic py-4 text-center">
                      No hay productos vendidos en este periodo.
                    </p>
                  )}
                </div>

                {/* Métodos de Pago */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/40 flex flex-col">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
                    💳 Ingresos por Método de Pago
                  </h3>

                  {data?.byPaymentMethod && data.byPaymentMethod.length > 0 ? (
                    <div className="space-y-3 my-auto">
                      {data.byPaymentMethod.map((m) => {
                        const percent = summary.totalRevenue > 0
                          ? Math.round((m.total / summary.totalRevenue) * 100)
                          : 0;

                        return (
                          <div key={m.paymentMethod} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="capitalize font-medium text-zinc-700 dark:text-zinc-300">
                                {m.paymentMethod} ({m.count} pedidos)
                              </span>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                ${m.total.toFixed(2)} ({percent}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic py-4 text-center my-auto">
                      No hay datos de recaudación en este periodo.
                    </p>
                  )}
                </div>
              </div>

              {/* Vista previa de ventas en el reporte */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Últimas Transacciones del Periodo ({data?.sales?.length || 0})
                  </h3>
                </div>

                {data?.sales && data.sales.length > 0 ? (
                  <div className="overflow-x-auto max-h-56 overflow-y-auto">
                    <table className="min-w-full text-xs divide-y divide-zinc-200 dark:divide-zinc-700">
                      <thead className="text-zinc-400 font-semibold bg-zinc-50 dark:bg-zinc-900 sticky top-0">
                        <tr>
                          <th className="text-left px-2.5 py-2">N° Pedido</th>
                          <th className="text-left px-2.5 py-2">Fecha</th>
                          <th className="text-left px-2.5 py-2">Cliente / Entrega</th>
                          <th className="text-left px-2.5 py-2">Estado</th>
                          <th className="text-right px-2.5 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {data.sales.slice(0, 20).map((s) => (
                          <tr key={s._id}>
                            <td className="px-2.5 py-2 font-mono font-medium text-blue-600 dark:text-blue-400">
                              {s.saleNumber}
                            </td>
                            <td className="px-2.5 py-2 text-zinc-500">
                              {new Date(s.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-2.5 py-2">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200 block truncate max-w-[160px]">
                                {s.recipientName}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {s.clientId?.name || "Sin cliente"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2">
                              <Badge variant={s.status === "completada" ? "success" : "danger"}>
                                {s.status === "completada" ? "Completada" : "Anulada"}
                              </Badge>
                            </td>
                            <td className="px-2.5 py-2 text-right font-bold text-zinc-900 dark:text-zinc-100">
                              ${s.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic py-4 text-center">
                    No se encontraron transacciones para este criterio.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pie de Página Fijo */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <span className="text-xs text-zinc-400">
            Exporta todos los registros filtrados en formato CSV para Excel o Google Sheets.
          </span>
          <Button variant="outline" type="button" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
