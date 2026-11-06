import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { FormField } from "./FormField";

describe("<FormField /> Molecule", () => {
  it("debe renderizar label, input y asociar el htmlFor con el id", () => {
    render(<FormField id="user-email" label="Correo Electrónico" placeholder="test@cpf.com" />);

    expect(screen.getByText("Correo Electrónico")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("test@cpf.com");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "user-email");
  });

  it("debe mostrar el mensaje de error cuando se le pasa la prop error", () => {
    render(
      <FormField
        id="password"
        label="Contraseña"
        error="La contraseña debe tener al menos 6 caracteres"
      />
    );

    expect(screen.getByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();
  });

  it("debe renderizar elemento a la derecha si se proporciona rightElement", () => {
    render(
      <FormField
        id="search"
        label="Búsqueda"
        rightElement={<span data-testid="right-icon">🔍</span>}
      />
    );

    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });
});
