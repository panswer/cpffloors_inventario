import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProductFormModal } from "./ProductFormModal";
import { ProductItem } from "@/services/productService";

describe("<ProductFormModal /> Organism", () => {
  it("no debe renderizar nada si isOpen es false", () => {
    const { container } = render(
      <ProductFormModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe mostrar campos de nombre, categoría, precio, stock y unidad", () => {
    render(
      <ProductFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(screen.getByText("Nuevo Producto")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio \(\$\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Stock/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Unidad/i)).toBeInTheDocument();
  });

  it("debe validar que nombre, precio y stock son requeridos", () => {
    render(
      <ProductFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    const form = screen.getByRole("button", { name: "Crear Producto" }).closest("form");
    fireEvent.submit(form!);

    expect(
      screen.getByText("Nombre, precio y stock son campos requeridos.")
    ).toBeInTheDocument();
  });

  it("debe enviar datos correctos al crear", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <ProductFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre del Producto/i), {
      target: { value: "Vasos Biodegradables 16oz" },
    });
    fireEvent.change(screen.getByLabelText(/Precio \(\$\)/i), {
      target: { value: "14.50" },
    });
    fireEvent.change(screen.getByLabelText(/^Stock/i, { selector: "input" }), {
      target: { value: "100" },
    });

    const form = screen.getByRole("button", { name: "Crear Producto" }).closest("form");
    fireEvent.submit(form!);

    expect(handleSubmit).toHaveBeenCalledWith({
      sku: undefined,
      name: "Vasos Biodegradables 16oz",
      description: "",
      category: "Contenedores",
      price: 14.5,
      stock: 100,
      unit: "paquete",
      imageUrl: "",
    });
  });

  it("debe precargar datos en edición", () => {
    const productToEdit: ProductItem = {
      _id: "prod-99",
      sku: "CON-9999",
      name: "Contenedor Rectangular",
      description: "Tapa incluida",
      category: "Contenedores",
      price: 20.0,
      stock: 45,
      unit: "caja",
      isActive: true,
      __v: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        productToEdit={productToEdit}
      />
    );

    expect(screen.getByText("Editar Producto")).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Nombre del Producto/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Contenedor Rectangular");

    const priceInput = screen.getByLabelText(/Precio \(\$\)/i) as HTMLInputElement;
    expect(priceInput.value).toBe("20");

    expect(screen.getByRole("button", { name: "Guardar Cambios" })).toBeInTheDocument();
  });
});
