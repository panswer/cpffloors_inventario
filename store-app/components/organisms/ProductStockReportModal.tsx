"use client";

import React, { useState } from "react";
import { useProductStockReport } from "@/hooks/useProducts";
import { ProductStockReportFilter, PRODUCT_CATEGORIES } from "@/services/productService";
import { Button, Badge } from "@/components/atoms";

interface ProductStockReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductStockReportModal: React.FC<ProductStockReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [category, setCategory] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "available">("all");

  const filters: ProductStockReportFilter = {
    category: category || undefined,
    isActive: isActive !== "" ? isActive : undefined,
    stockFilter,
  };

  const { data, isLoading, isError, error } = useProductStockReport(filters);

  if (!isOpen) return null;

  // Generar y descargar archivo CSV
  const handleExportCSV = () => {
    if (!data?.products || data.products.length === 0) {
      alert("No hay productos disponibles para exportar con estos filtros.");
      return;
    }

    const headers = [
      "SKU",
      "Producto",
      "Categoria",
      "Stock Restante",
      "Unidad",
      "Precio Unitario ($)",
      "Valorizacion Total ($)",
      "Estado Stock",
      "Activo",
      "Fecha Actualizacion",
    ];

    const rows = data.products.map((p) => {
      let stockStatus = "Disponible";
      if (p.stock <= 0) stockStatus = "Agotado";
      else if (p.stock <= 5) stockStatus = "Critico / Bajo";

      const totalVal = (p.stock * p.price).toFixed(2);

      return [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        String(p.stock),
        `"${p.unit || "unidad"}"`,
        p.price.toFixed(2),
        totalVal,
        `"${stockStatus}"`,
        p.isActive ? "Activo" : "Baja",
        `"${new Date(p.updatedAt).toLocaleDateString()}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_stock_productos_${now}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || {
    totalProducts: 0,
    totalStockUnits: 0,
    totalStockValue: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    categorySummary: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Cabecera Fija */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                📦
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Reporte de Existencias e Inventario
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Control de stock disponible, productos agotados y exportación en CSV
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              disabled={isLoading || !data?.products?.length}
              className="text-xs !py-1.5 !px-3 font-semibold"
            >
              📥 Descargar Reporte (CSV)
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
              Filtros de Inventario
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Todas las categorías</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Nivel de Stock
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="available">Con Stock Disponible (&gt; 0)</option>
                  <option value="low">Stock Crítico (1 a 5 unidades)</option>
                  <option value="out">Agotados (0 unidades)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-500 block mb-1">
                  Estado del Producto
                </label>
                <select
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Todos (Activos y Bajas)</option>
                  <option value="true">Solo Activos</option>
                  <option value="false">Solo Dados de Baja</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="text-xs text-zinc-500">Calculando existencias y valorización...</p>
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error ? (error as Error).message : "Error al cargar reporte de inventario"}
            </div>
          ) : (
            <>
              {/* Tarjetas KPI de Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Unidades Totales
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {summary.totalStockUnits.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    En {summary.totalProducts} productos
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Valorización Stock
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    ${summary.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Precio venta estimado
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Stock Crítico
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
                    {summary.lowStockCount}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Entre 1 y 5 unidades
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60">
                  <span className="text-[11px] font-medium text-zinc-400 block uppercase">
                    Agotados
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
                    {summary.outOfStockCount}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    0 unidades en stock
                  </span>
                </div>
              </div>

              {/* Desglose por Categoría */}
              {summary.categorySummary && summary.categorySummary.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
                    📂 Existencias por Categoría
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {summary.categorySummary.map((cat) => (
                      <div
                        key={cat.category}
                        className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                            {cat.category}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400">
                            {cat.productCount} productos
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-baseline">
                          <span className="text-xs text-zinc-500">Unidades:</span>
                          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            {cat.totalStock.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="text-xs text-zinc-500">Valor:</span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            ${cat.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Listado de Productos en el Reporte */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Detalle de Productos ({data?.products?.length || 0})
                  </h3>
                </div>

                {data?.products && data.products.length > 0 ? (
                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="min-w-full text-xs divide-y divide-zinc-200 dark:divide-zinc-700">
                      <thead className="text-zinc-400 font-semibold bg-zinc-50 dark:bg-zinc-900 sticky top-0">
                        <tr>
                          <th className="text-left px-2.5 py-2">SKU</th>
                          <th className="text-left px-2.5 py-2">Producto</th>
                          <th className="text-left px-2.5 py-2">Categoría</th>
                          <th className="text-right px-2.5 py-2">Stock</th>
                          <th className="text-right px-2.5 py-2">Precio</th>
                          <th className="text-right px-2.5 py-2">Valor Total</th>
                          <th className="text-center px-2.5 py-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {data.products.map((p) => {
                          const isOut = p.stock <= 0;
                          const isLow = p.stock > 0 && p.stock <= 5;

                          return (
                            <tr key={p._id}>
                              <td className="px-2.5 py-2 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                                {p.sku}
                              </td>
                              <td className="px-2.5 py-2">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200 block truncate max-w-[200px]">
                                  {p.name}
                                </span>
                              </td>
                              <td className="px-2.5 py-2 text-zinc-500">
                                {p.category}
                              </td>
                              <td className="px-2.5 py-2 text-right">
                                <span
                                  className={`font-black ${
                                    isOut
                                      ? "text-rose-600 dark:text-rose-400"
                                      : isLow
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-zinc-900 dark:text-zinc-100"
                                  }`}
                                >
                                  {p.stock}
                                </span>{" "}
                                <span className="text-[10px] text-zinc-400">
                                  {p.unit || "paquete"}
                                </span>
                              </td>
                              <td className="px-2.5 py-2 text-right text-zinc-700 dark:text-zinc-300">
                                ${p.price.toFixed(2)}
                              </td>
                              <td className="px-2.5 py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                                ${(p.stock * p.price).toFixed(2)}
                              </td>
                              <td className="px-2.5 py-2 text-center">
                                {isOut ? (
                                  <Badge variant="danger">Agotado</Badge>
                                ) : isLow ? (
                                  <Badge variant="warning">Crítico</Badge>
                                ) : (
                                  <Badge variant="success">OK</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic py-4 text-center">
                    No se encontraron productos con estos criterios.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pie de Página Fijo */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <span className="text-xs text-zinc-400">
            Exporta las existencias en CSV para auditoría, reabastecimiento o contabilidad.
          </span>
          <Button variant="outline" type="button" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
