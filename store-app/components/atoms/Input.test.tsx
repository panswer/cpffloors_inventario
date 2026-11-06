import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Input } from "./Input";

describe("<Input /> Atom", () => {
  it("debe renderizar el elemento input con su placeholder", () => {
    render(<Input placeholder="Buscar por SKU..." />);
    expect(screen.getByPlaceholderText("Buscar por SKU...")).toBeInTheDocument();
  });

  it("debe capturar cambios al escribir y ejecutar el onChange", () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Nombre" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: "Contenedor 16oz" } });

    expect(handleChange).toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("Contenedor 16oz");
  });

  it("debe aplicar estilos de error cuando hasError es true", () => {
    render(<Input hasError placeholder="Email" />);
    const input = screen.getByPlaceholderText("Email");
    expect(input).toHaveClass("border-red-500");
  });

  it("debe deshabilitarse cuando se especifica disabled", () => {
    render(<Input disabled placeholder="Bloqueado" />);
    expect(screen.getByPlaceholderText("Bloqueado")).toBeDisabled();
  });
});
