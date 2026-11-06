import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ClientFormModal } from "./ClientFormModal";
import { ClientItem } from "@/services/clientService";

describe("<ClientFormModal /> Organism", () => {
  it("no debe renderizar nada si isOpen es false", () => {
    const { container } = render(
      <ClientFormModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe mostrar campos de documento, nombre, teléfono y dirección", () => {
    render(
      <ClientFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(screen.getByText("Nuevo Cliente")).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento \/ RIF \/ Cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre o Razón Social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
  });

  it("debe validar campos requeridos (documento y nombre)", () => {
    render(
      <ClientFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    const form = screen.getByRole("button", { name: "Crear Cliente" }).closest("form");
    fireEvent.submit(form!);

    expect(
      screen.getByText("Documento/Identificación y Nombre son obligatorios.")
    ).toBeInTheDocument();
  });

  it("debe enviar datos correctos al crear", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <ClientFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/Documento \/ RIF \/ Cédula/i), {
      target: { value: "j-99887766" },
    });
    fireEvent.change(screen.getByLabelText(/Nombre o Razón Social/i), {
      target: { value: "Inversiones del Norte C.A." },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: "+58 412 1112233" },
    });

    const form = screen.getByRole("button", { name: "Crear Cliente" }).closest("form");
    fireEvent.submit(form!);

    expect(handleSubmit).toHaveBeenCalledWith({
      documentId: "J-99887766",
      name: "Inversiones del Norte C.A.",
      email: "",
      phone: "+58 412 1112233",
      address: "",
      notes: "",
    });
  });

  it("debe cargar los datos al editar y deshabilitar el documento", () => {
    const clientToEdit: ClientItem = {
      _id: "c-100",
      documentId: "J-12345678",
      name: "Cliente Existente",
      email: "cliente@empresa.com",
      phone: "555-1234",
      address: "Calle 1",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <ClientFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        clientToEdit={clientToEdit}
      />
    );

    expect(screen.getByText("Editar Cliente")).toBeInTheDocument();
    const docInput = screen.getByLabelText(/Documento \/ RIF \/ Cédula/i) as HTMLInputElement;
    expect(docInput.value).toBe("J-12345678");
    expect(docInput).toBeDisabled();

    expect(screen.getByRole("button", { name: "Guardar Cambios" })).toBeInTheDocument();
  });
});
