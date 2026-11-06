import React from "react";
import { UserItem } from "@/services/userService";
import { Badge, Button } from "../atoms";
import { Table, Column } from "../molecules";

interface UsersTableProps {
  users: UserItem[];
  isLoading: boolean;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  currentUserId?: string;
  currentUserRole?: string;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  onEdit,
  onDelete,
  currentUserId,
  currentUserRole = "user",
}) => {
  const isAdmin = currentUserRole === "admin";
  const isManager = currentUserRole === "manager";

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "info";
      case "manager":
        return "warning";
      default:
        return "default";
    }
  };

  const columns: Column<UserItem>[] = [
    {
      header: "Usuario / Nombre",
      render: (u) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            {u.username}
          </div>
          {u.name && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {u.name}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Rol",
      render: (u) => <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>,
    },
    {
      header: "Estado",
      render: (u) => {
        const isLocked = u.lockUntil && new Date(u.lockUntil) > new Date();
        if (isLocked) {
          return <Badge variant="danger">Bloqueado (Intentos)</Badge>;
        }
        return (
          <Badge variant={u.isActive ? "success" : "danger"}>
            {u.isActive ? "Activo" : "Inactivo / Baja"}
          </Badge>
        );
      },
    },
    {
      header: "Creado",
      className: "text-xs text-zinc-500 dark:text-zinc-400",
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (u) => {
        // Reglas de edición y baja:
        // - admin: puede editar y dar de baja a cualquiera (excepto darse de baja a sí mismo)
        // - manager: solamente puede editar y dar de baja a usuarios con rol "user"
        const canManageThisUser =
          isAdmin || (isManager && u.role === "user");

        return (
          <div className="flex items-center justify-end gap-2">
            {canManageThisUser && (
              <Button
                variant="outline"
                className="!py-1 !px-2.5 text-xs"
                onClick={() => onEdit(u)}
              >
                Editar
              </Button>
            )}
            {canManageThisUser && u.isActive && u._id !== currentUserId && (
              <button
                onClick={() => onDelete(u)}
                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Dar de Baja
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      data={users}
      columns={columns}
      keyExtractor={(u) => u._id}
      isLoading={isLoading}
      loadingMessage="Cargando usuarios..."
      emptyMessage="No se encontraron usuarios registrados o coincidentes."
      pagination={true}
    />
  );
};
