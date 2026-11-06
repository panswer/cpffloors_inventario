import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "./Badge";

describe("<Badge /> Atom", () => {
  it("debe renderizar el contenido hijo", () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("debe aplicar la clase de variante success", () => {
    const { container } = render(<Badge variant="success">Completada</Badge>);
    expect(container.firstChild).toHaveClass("text-emerald-700");
  });

  it("debe aplicar la clase de variante danger", () => {
    const { container } = render(<Badge variant="danger">Anulada</Badge>);
    expect(container.firstChild).toHaveClass("text-rose-700");
  });

  it("debe aplicar la variante default si no se especifica", () => {
    const { container } = render(<Badge>Normal</Badge>);
    expect(container.firstChild).toHaveClass("bg-zinc-100");
  });
});
