import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { UserFormModal } from "./UserFormModal";
import { UserItem } from "@/services/userService";

describe("<UserFormModal /> Organism", () => {
  it("no debe renderizar nada si isOpen es false", () => {
    const { container } = render(
      <UserFormModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe mostrar campos de creación y validar requeridos", async () => {
    render(
      <UserFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        currentUserRole="admin"
      />
    );

    expect(screen.getByText("Nuevo Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre de Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i, { selector: "input" })).toBeInTheDocument();

    const form = screen.getByRole("button", { name: "Crear Usuario" }).closest("form");
    fireEvent.submit(form!);

    expect(screen.getByText("Usuario y contraseña requeridos.")).toBeInTheDocument();
  });

  it("debe enviar datos correctos al crear un usuario", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <UserFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        currentUserRole="admin"
      />
    );

    fireEvent.change(screen.getByLabelText(/^Nombre de Usuario/i), {
      target: { value: "nuevo_admin" },
    });
    fireEvent.change(screen.getByLabelText(/^Nombre Completo/i), {
      target: { value: "Nuevo Admin" },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i, { selector: "input" }), {
      target: { value: "clave123" },
    });

    const submitBtn = screen.getByRole("button", { name: "Crear Usuario" });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      username: "nuevo_admin",
      name: "Nuevo Admin",
      role: "user",
      password: "clave123",
    });
  });

  it("debe rellenar los datos al editar y deshabilitar el username", () => {
    const userToEdit: UserItem = {
      _id: "user-1",
      username: "usuario_existente",
      name: "Juan Pérez",
      role: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <UserFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        userToEdit={userToEdit}
        currentUserRole="admin"
      />
    );

    expect(screen.getByText("Editar Usuario")).toBeInTheDocument();
    const userInput = screen.getByLabelText(/^Nombre de Usuario/i) as HTMLInputElement;
    expect(userInput.value).toBe("usuario_existente");
    expect(userInput).toBeDisabled();

    expect(screen.getByRole("button", { name: "Guardar Cambios" })).toBeInTheDocument();
  });

  it("regla de rol manager: el selector de rol debe estar oculto y forzar rol 'user'", () => {
    render(
      <UserFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        currentUserRole="manager"
      />
    );

    // Los managers no tienen selector de rol visible (se fuerza automáticamente a 'user')
    expect(screen.queryByLabelText(/^Rol de Usuario/i)).toBeNull();
  });
});
