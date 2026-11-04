import React from "react";
import { ClientItem } from "@/services/clientService";
import { Badge, Button } from "../atoms";
import { Table, Column } from "../molecules";

interface ClientsTableProps {
  clients: ClientItem[];
  isLoading: boolean;
  onEdit: (client: ClientItem) => void;
  onDelete: (client: ClientItem) => void;
  canDelete: boolean;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const columns: Column<ClientItem>[] = [
    {
      header: "Documento / Cliente",
      render: (c) => (
        <div>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
            {c.documentId}
          </span>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
            {c.name}
          </div>
          {c.notes && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
              {c.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Contacto",
      render: (c) => (
        <div>
          {c.email ? (
            <div className="text-zinc-900 dark:text-zinc-100">{c.email}</div>
          ) : (
            <div className="text-xs text-zinc-400">Sin correo</div>
          )}
          {c.phone && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{c.phone}</div>
          )}
        </div>
      ),
    },
    {
      header: "Dirección",
      className: "text-xs text-zinc-600 dark:text-zinc-300 max-w-xs truncate",
      render: (c) => c.address || "No especificada",
    },
    {
      header: "Estado",
      render: (c) => (
        <Badge variant={c.isActive ? "success" : "danger"}>
          {c.isActive ? "Activo" : "Baja"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="!py-1 !px-2.5 text-xs"
            onClick={() => onEdit(c)}
          >
            Editar
          </Button>
          {c.isActive && canDelete && (
            <button
              onClick={() => onDelete(c)}
              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Dar de Baja
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      data={clients}
      columns={columns}
      keyExtractor={(c) => c._id}
      isLoading={isLoading}
      loadingMessage="Cargando directorio de clientes..."
      emptyMessage="No se encontraron clientes registrados o coincidentes."
      pagination={true}
    />
  );
};
