"use client";

import React, { useState } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  headerClassName?: string;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationConfig {
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (newPage: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (newSize: number) => void;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  // Soporte de paginación
  pagination?: boolean | PaginationConfig;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingMessage = "Cargando información...",
  emptyMessage = "No se encontraron registros para mostrar.",
  pagination = false,
}: TableProps<T>) {
  // Paginación local en el cliente si pagination === true
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(10);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm font-medium">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Determinar si la paginación es controlada por el servidor o local (automática)
  const isPaginationEnabled = Boolean(pagination);
  const isControlled = typeof pagination === "object" && pagination !== null;

  const currentPage = isControlled
    ? pagination.currentPage || 1
    : localPage;

  const pageSize = isControlled
    ? pagination.pageSize || 10
    : localPageSize;

  const totalItems = isControlled && pagination.totalItems !== undefined
    ? pagination.totalItems
    : data.length;

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Si es local, rebanar los datos
  const paginatedData = isPaginationEnabled && !isControlled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isControlled && pagination.onPageChange) {
      pagination.onPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleSizeChange = (newSize: number) => {
    if (isControlled && pagination.onPageSizeChange) {
      pagination.onPageSizeChange(newSize);
    } else {
      setLocalPageSize(newSize);
      setLocalPage(1);
    }
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3.5 ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-6 py-4 ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(item)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación */}
      {isPaginationEnabled && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Mostrando</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {startRecord} - {endRecord}
            </span>
            <span>de</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {totalItems}
            </span>
            <span>registros</span>

            {/* Selector de cantidad por página */}
            <div className="ml-4 flex items-center gap-1.5">
              <span>Por pág:</span>
              <select
                value={pageSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {(
                  (typeof pagination === "object" && pagination.pageSizeOptions) || [
                    5, 10, 20, 50,
                  ]
                ).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              title="Página anterior"
            >
              ‹
            </button>

            <span className="px-3 font-medium text-zinc-700 dark:text-zinc-300">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              title="Página siguiente"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
