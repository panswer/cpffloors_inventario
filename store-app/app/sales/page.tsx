"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardTemplate } from "@/components/templates";
import { SalesTable, SaleFormModal, SaleDetailModal, SalesReportModal } from "@/components/organisms";
import { Button, Input } from "@/components/atoms";
import { useAuth } from "@/hooks/useAuth";
import { useSales } from "@/hooks/useSales";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { SaleRecord, CreateSaleInput } from "@/services/saleService";

export default function SalesPage() {
  const { user: currentUser, logout, isLoggingOut } = useAuth();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

  // Hooks de datos
  const { sales, count, isLoading, createSale, isCreating, cancelSale } = useSales({
    search: searchTerm,
    status: statusFilter,
    paymentMethod: paymentFilter,
  });

  const { clients } = useClients({ isActive: true });
  const { products } = useProducts({ isActive: true });

  const canCancel = currentUser?.role === "admin" || currentUser?.role === "manager";

  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (sale: SaleRecord) => {
    setSelectedSale(sale);
  };

  const handleCancelSale = async (sale: SaleRecord) => {
    const reason = window.prompt(
      `¿Deseas anular la venta "${sale.saleNumber}"? El stock de los productos será devuelto al inventario. Indica el motivo (opcional):`
    );
    if (reason !== null) {
      try {
        await cancelSale({ id: sale._id, notes: reason });
      } catch (err: any) {
        alert(err.message || "Error al anular la venta");
      }
    }
  };

  const handleCreateSaleSubmit = async (data: CreateSaleInput) => {
    await createSale(data);
  };

  return (
    <DashboardTemplate user={currentUser} onLogout={logout} isLoggingOut={isLoggingOut}>
      {/* Navegación superior y Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-blue-600 transition">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Ventas</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Registro de Ventas y Pedidos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Transacciones, entregas y despachos ({count} total)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={() => setIsReportModalOpen(true)}>
            📊 Reportes y Exportación
          </Button>
          <Button variant="primary" onClick={handleOpenCreate}>
            + Nueva Venta / Pedido
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-3">
        <div>
          <Input
            placeholder="Buscar por N° venta, entrega o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="completada">Completadas</option>
            <option value="anulada">Anuladas</option>
          </select>
        </div>

        <div>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Métodos de pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="credito">Crédito</option>
          </select>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <SalesTable
        sales={sales}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onCancelSale={handleCancelSale}
        canCancel={canCancel}
      />

      {/* Modal para Crear Venta / Pedido */}
      <SaleFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSaleSubmit}
        clients={clients}
        products={products}
        isLoading={isCreating}
      />

      {/* Modal para Ver Detalle de la Venta */}
      <SaleDetailModal
        saleId={selectedSale?._id || null}
        initialSale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />

      {/* Modal de Reportes y Métricas */}
      <SalesReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </DashboardTemplate>
  );
}
