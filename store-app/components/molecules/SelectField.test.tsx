import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SelectField } from "./SelectField";

describe("<SelectField /> Molecule", () => {
  const options = [
    { label: "Seleccionar...", value: "" },
    { label: "Contenedores", value: "Contenedores" },
    { label: "Vasos", value: "Vasos" },
  ];

  it("debe renderizar las opciones y su etiqueta", () => {
    render(<SelectField id="cat-select" label="Categoría" options={options} />);

    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Contenedores")).toBeInTheDocument();
    expect(screen.getByText("Vasos")).toBeInTheDocument();
  });

  it("debe capturar el evento onChange al cambiar de opción", () => {
    const handleChange = vi.fn();
    render(
      <SelectField
        id="cat-select"
        label="Categoría"
        options={options}
        onChange={handleChange}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Vasos" } });

    expect(handleChange).toHaveBeenCalled();
    expect((select as HTMLSelectElement).value).toBe("Vasos");
  });

  it("debe mostrar mensaje de error si se proporciona", () => {
    render(
      <SelectField
        id="cat-select"
        label="Categoría"
        options={options}
        error="Campo obligatorio"
      />
    );

    expect(screen.getByText("Campo obligatorio")).toBeInTheDocument();
  });
});
