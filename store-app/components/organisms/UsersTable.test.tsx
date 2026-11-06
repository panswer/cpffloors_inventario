import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { UsersTable } from "./UsersTable";
import { UserItem } from "@/services/userService";

describe("<UsersTable /> Organism", () => {
  const mockUsers: UserItem[] = [
    {
      _id: "u-admin",
      username: "adminuser",
      name: "Administrador General",
      role: "admin",
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
    },
    {
      _id: "u-manager",
      username: "manageruser",
      name: "Gerente Operativo",
      role: "manager",
      isActive: true,
      createdAt: new Date("2026-01-02T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-01-02T00:00:00Z").toISOString(),
    },
    {
      _id: "u-user",
      username: "regularuser",
      name: "Operador de Bodega",
      role: "user",
      isActive: true,
      createdAt: new Date("2026-01-03T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-01-03T00:00:00Z").toISOString(),
    },
  ];

  it("debe renderizar nombres de usuarios, roles y estados", () => {
    render(
      <UsersTable
        users={mockUsers}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserRole="admin"
        currentUserId="u-admin"
      />
    );

    expect(screen.getByText("adminuser")).toBeInTheDocument();
    expect(screen.getByText("Administrador General")).toBeInTheDocument();
    expect(screen.getByText("manageruser")).toBeInTheDocument();
    expect(screen.getByText("regularuser")).toBeInTheDocument();
    expect(screen.getAllByText("Activo")).toHaveLength(3);
  });

  it("regla de rol admin: puede editar a todos los usuarios", () => {
    const handleEdit = vi.fn();
    render(
      <UsersTable
        users={mockUsers}
        isLoading={false}
        onEdit={handleEdit}
        onDelete={vi.fn()}
        currentUserRole="admin"
        currentUserId="u-admin"
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    expect(editButtons).toHaveLength(3);

    fireEvent.click(editButtons[0]);
    expect(handleEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("regla de rol admin: no debe poder darse de baja a sí mismo", () => {
    render(
      <UsersTable
        users={mockUsers}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserRole="admin"
        currentUserId="u-admin"
      />
    );

    // Puede dar de baja a manager y user, pero no a sí mismo (u-admin)
    const deleteButtons = screen.getAllByRole("button", { name: /Dar de Baja/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("regla de rol manager: sólo puede editar y dar de baja a usuarios con rol 'user'", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <UsersTable
        users={mockUsers}
        isLoading={false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUserRole="manager"
        currentUserId="u-manager"
      />
    );

    // Solamente 1 botón de editar (para regularuser con rol 'user')
    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    expect(editButtons).toHaveLength(1);

    fireEvent.click(editButtons[0]);
    expect(handleEdit).toHaveBeenCalledWith(mockUsers[2]);

    // Solamente 1 botón de dar de baja
    const deleteButtons = screen.getAllByRole("button", { name: /Dar de Baja/i });
    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(deleteButtons[0]);
    expect(handleDelete).toHaveBeenCalledWith(mockUsers[2]);
  });
});
