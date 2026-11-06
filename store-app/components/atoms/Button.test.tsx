import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Button } from "./Button";

describe("<Button /> Atom", () => {
  it("debe renderizar el texto proporcionado como hijo", () => {
    render(<Button>Guardar Producto</Button>);
    expect(screen.getByText("Guardar Producto")).toBeInTheDocument();
  });

  it("debe invocar la función onClick cuando el usuario hace clic", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Acción</Button>);

    fireEvent.click(screen.getByText("Acción"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("debe deshabilitarse y mostrar el spinner cuando isLoading es true", () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Enviar
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("debe aplicar la clase de variante secundaria", () => {
    const { container } = render(<Button variant="secondary">Secundario</Button>);
    expect(container.firstChild).toHaveClass("bg-zinc-100");
  });
});
