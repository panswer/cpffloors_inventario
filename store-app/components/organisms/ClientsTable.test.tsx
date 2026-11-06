import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ClientsTable } from "./ClientsTable";
import { ClientItem } from "@/services/clientService";

describe("<ClientsTable /> Organism", () => {
  const mockClients: ClientItem[] = [
    {
      _id: "c-1",
      documentId: "J-12345678",
      name: "Restaurante La Casona",
      email: "contacto@lacasona.com",
      phone: "+58 414 1234567",
      address: "Av. Principal 45",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "c-2",
      documentId: "V-87654321",
      name: "Pedro Pérez",
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("debe renderizar documento, nombre, contacto y estado del cliente", () => {
    render(
      <ClientsTable
        clients={mockClients}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        canDelete={true}
      />
    );

    expect(screen.getByText("J-12345678")).toBeInTheDocument();
    expect(screen.getByText("Restaurante La Casona")).toBeInTheDocument();
    expect(screen.getByText("contacto@lacasona.com")).toBeInTheDocument();
    expect(screen.getByText("+58 414 1234567")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();

    expect(screen.getByText("V-87654321")).toBeInTheDocument();
    expect(screen.getByText("Pedro Pérez")).toBeInTheDocument();
    expect(screen.getByText("Sin correo")).toBeInTheDocument();
    expect(screen.getByText("Baja")).toBeInTheDocument();
  });

  it("debe invocar onEdit al presionar 'Editar'", () => {
    const handleEdit = vi.fn();
    render(
      <ClientsTable
        clients={mockClients}
        isLoading={false}
        onEdit={handleEdit}
        onDelete={vi.fn()}
        canDelete={true}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    fireEvent.click(editButtons[0]);

    expect(handleEdit).toHaveBeenCalledWith(mockClients[0]);
  });

  it("solo debe mostrar botón 'Dar de Baja' si el cliente está activo y canDelete es true", () => {
    const handleDelete = vi.fn();
    render(
      <ClientsTable
        clients={mockClients}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={handleDelete}
        canDelete={true}
      />
    );

    // Solo c-1 está activo
    const deleteButtons = screen.getAllByRole("button", { name: /Dar de Baja/i });
    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(deleteButtons[0]);
    expect(handleDelete).toHaveBeenCalledWith(mockClients[0]);
  });
});
