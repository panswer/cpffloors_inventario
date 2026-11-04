"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardTemplate } from "@/components/templates";
import { ClientsTable, ClientFormModal } from "@/components/organisms";
import { Button, Input } from "@/components/atoms";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { ClientItem } from "@/services/clientService";

export default function ClientsPage() {
  const { user: currentUser, logout, isLoggingOut } = useAuth();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);

  // Hook conectado a API con React Query
  const {
    clients,
    count,
    isLoading,
    createClient,
    isCreating,
    updateClient,
    isUpdating,
    deleteClient,
  } = useClients({
    search: searchTerm,
    isActive: activeFilter,
  });

  const canDelete = currentUser?.role === "admin" || currentUser?.role === "manager";

  const handleOpenCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: ClientItem) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (client: ClientItem) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas dar de baja al cliente "${client.name}" (${client.documentId})?`
    );
    if (confirmed) {
      try {
        await deleteClient(client._id);
      } catch (err: any) {
        alert(err.message || "Error al dar de baja al cliente");
      }
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (selectedClient) {
      await updateClient({ id: selectedClient._id, data: formData });
    } else {
      await createClient(formData);
    }
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
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Clientes</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Directorio de Clientes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Base de clientes y empresas registradas ({count} total)
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          + Nuevo Cliente
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
        <div>
          <Input
            placeholder="Buscar por documento, nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Dados de Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <ClientsTable
        clients={clients}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        canDelete={canDelete}
      />

      {/* Modal de Creación / Edición */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        clientToEdit={selectedClient}
        isLoading={isCreating || isUpdating}
      />
    </DashboardTemplate>
  );
}
