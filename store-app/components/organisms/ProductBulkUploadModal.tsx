"use client";

import React, { useState, useRef } from "react";
import { Button, Badge } from "@/components/atoms";
import { parseCsvContent, CsvParsedRow } from "@/lib/csvParser";
import { BulkImportResult } from "@/services/productService";

interface ProductBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[], mode: "add" | "set") => Promise<BulkImportResult>;
  isLoading?: boolean;
}

export const ProductBulkUploadModal: React.FC<ProductBulkUploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<CsvParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importMode, setImportMode] = useState<"add" | "set">("add");
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent =
      "\uFEFF" +
      "sku,nombre,categoria,precio,stock,unidad,descripcion\n" +
      "CON-A1B2C3,Contenedor Plastico 16oz,Contenedores,12.50,100,paquete,Contenedor transparente para alimentos\n" +
      "VAS-D4E5F6,Vaso Plastico 12oz,Vasos,8.00,50,paquete,Vasos desechables transparentes\n" +
      ",Cubierto Tenedor Economico,Cubiertos,5.20,200,paquete,Tenedores plasticos blancos\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_carga_productos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { rows, errors } = parseCsvContent(text);
      setParsedRows(rows);
      setParseErrors(errors);
    };
    reader.onerror = () => {
      setErrorMsg("Error al leer el archivo seleccionado.");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleExecuteImport = async () => {
    setErrorMsg(null);
    const validRows = parsedRows.filter((r) => !r.error);
    if (validRows.length === 0) {
      setErrorMsg("No hay filas válidas para importar.");
      return;
    }

    try {
      const itemsPayload = validRows.map((r) => ({
        sku: r.sku,
        name: r.name,
        category: r.category,
        price: r.price,
        stock: r.stock,
        unit: r.unit,
        description: r.description,
      }));

      const res = await onImport(itemsPayload, importMode);
      setResult(res);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la carga masiva");
    }
  };

  const validCount = parsedRows.filter((r) => !r.error).length;
  const invalidCount = parsedRows.filter((r) => r.error).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                📄
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Carga Masiva de Productos e Inventario
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Importa nuevos productos o actualiza el stock desde una hoja de cálculo (CSV)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleDownloadTemplate}
              className="text-xs !py-1.5 !px-3"
            >
              📥 Descargar Plantilla CSV
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Resultado de importación previa */}
          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  ✅ {result.message}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {result.summary.created} creados | {result.summary.updated} actualizados
                </span>
              </div>
              {result.errors.length > 0 && (
                <div className="pt-2 text-xs text-rose-600 dark:text-rose-400 border-t border-emerald-200 dark:border-emerald-800">
                  <p className="font-semibold mb-1">Filas omitidas o con error:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>
                        Fila {e.row} ({e.item}): {e.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Selector de Archivo y Modo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Selecciona archivo CSV
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
              {fileName && (
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Archivo cargado: <strong className="text-zinc-700 dark:text-zinc-300">{fileName}</strong>
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Comportamiento de Stock
              </label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as "add" | "set")}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="add">➕ Sumar al stock actual</option>
                <option value="set">🔁 Reemplazar stock exacto</option>
              </select>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                {importMode === "add"
                  ? "Suma la cantidad al inventario actual."
                  : "Fija la cantidad como nuevo stock total."}
              </span>
            </div>
          </div>

          {/* Errores globales de parseo */}
          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <ul className="list-disc list-inside space-y-1">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Previsualización de filas a importar */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Previsualización de Datos ({parsedRows.length} filas detectadas)
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ {validCount} válidas
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-500 font-semibold">
                      ✕ {invalidCount} con errores
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800/50 max-h-64 overflow-y-auto">
                <table className="min-w-full text-xs divide-y divide-zinc-200 dark:divide-zinc-700">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Fila</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-left">Categoría</th>
                      <th className="px-3 py-2 text-right">Precio</th>
                      <th className="px-3 py-2 text-right">Cantidad</th>
                      <th className="px-3 py-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.error ? "bg-red-50/50 dark:bg-red-950/20" : ""}
                      >
                        <td className="px-3 py-2 font-mono text-zinc-400">
                          #{row.rowNumber}
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold">
                          {row.sku || <span className="text-zinc-400 italic">Auto</span>}
                        </td>
                        <td className="px-3 py-2 font-medium max-w-[180px] truncate">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 text-zinc-500">{row.category}</td>
                        <td className="px-3 py-2 text-right">
                          {row.price !== undefined ? `$${row.price.toFixed(2)}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                          {importMode === "add" ? `+${row.stock}` : row.stock} {row.unit}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.error ? (
                            <span className="text-[10px] text-rose-500 font-medium" title={row.error}>
                              ⚠️ {row.error}
                            </span>
                          ) : (
                            <Badge variant="success">Listo</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parsedRows.length === 0 && !result && (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-2">
              <span className="text-3xl block">📊</span>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Arrastra tu archivo CSV o descárgate la plantilla
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Si el producto ya existe (por SKU o nombre), aumentará su stock automáticamente y registrará el movimiento en Grafana. Si no existe, creará el producto en el catálogo.
              </p>
            </div>
          )}
        </div>

        {/* Pie de Página */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <Button variant="outline" type="button" onClick={onClose}>
            {result ? "Cerrar" : "Cancelar"}
          </Button>

          {parsedRows.length > 0 && (
            <Button
              variant="primary"
              onClick={handleExecuteImport}
              isLoading={isLoading}
              disabled={validCount === 0}
            >
              Procesar {validCount} Producto{validCount !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
