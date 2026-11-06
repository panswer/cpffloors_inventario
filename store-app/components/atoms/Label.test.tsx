import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Label } from "./Label";

describe("<Label /> Atom", () => {
  it("debe renderizar el texto de la etiqueta", () => {
    render(<Label htmlFor="test-id">Nombre del Producto</Label>);
    const label = screen.getByText("Nombre del Producto");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "test-id");
  });

  it("debe mostrar asterisco rojo cuando required es true", () => {
    render(<Label required>Precio Unitario</Label>);
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("*")).toHaveClass("text-red-500");
  });

  it("no debe mostrar asterisco si required es false", () => {
    render(<Label required={false}>Notas</Label>);
    expect(screen.queryByText("*")).toBeNull();
  });
});
