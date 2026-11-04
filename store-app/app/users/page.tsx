"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardTemplate } from "@/components/templates";
import { UsersTable, UserFormModal } from "@/components/organisms";
import { Button, Input } from "@/components/atoms";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { UserItem } from "@/services/userService";

export default function UsersPage() {
  const { user: currentUser, logout, isLoggingOut } = useAuth();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");

  // Estados para el Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Hook de Usuarios conectado a la API vía React Query
  const {
    users,
    count,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
  } = useUsers({
    search: searchTerm,
    role: roleFilter,
    isActive: activeFilter,
  });

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: UserItem) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas dar de baja al usuario "${user.username}"?`
    );
    if (confirmed) {
      try {
        await deleteUser(user._id);
      } catch (err: any) {
        alert(err.message || "Error al dar de baja al usuario");
      }
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (selectedUser) {
      await updateUser({ id: selectedUser._id, data: formData });
    } else {
      await createUser(formData);
    }
  };

  return (
    <DashboardTemplate user={currentUser} onLogout={logout} isLoggingOut={isLoggingOut}>
      {/* Navegación y encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-blue-600 transition">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Usuarios</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Total registrados: {count}
          </p>
        </div>

        {/* Botón de creación disponible tanto para admin como para manager */}
        {(currentUser?.role === "admin" || currentUser?.role === "manager") && (
          <Button variant="primary" onClick={handleOpenCreate}>
            + Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-3">
        <div>
          <Input
            placeholder="Buscar por usuario o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="user">Usuario Estándar</option>
          </select>
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

      {/* Tabla de Usuarios */}
      <UsersTable
        users={users}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        currentUserId={currentUser?.id}
        currentUserRole={currentUser?.role}
      />

      {/* Modal de Creación / Edición */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        userToEdit={selectedUser}
        isLoading={isCreating || isUpdating}
        currentUserRole={currentUser?.role}
      />
    </DashboardTemplate>
  );
}
