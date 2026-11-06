import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProductsTable } from "./ProductsTable";
import { ProductItem } from "@/services/productService";

describe("<ProductsTable /> Organism", () => {
  const mockProducts: ProductItem[] = [
    {
      _id: "prod-1",
      sku: "CON-001",
      name: "Contenedor 16oz",
      description: "Plástico para alimentos",
      category: "Contenedores",
      price: 15.5,
      stock: 50,
      unit: "paquete",
      isActive: true,
      __v: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "prod-2",
      sku: "VAS-002",
      name: "Vaso 8oz",
      category: "Vasos",
      price: 6.0,
      stock: 0,
      unit: "paquete",
      isActive: false,
      __v: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("debe renderizar la lista de productos con SKU, nombre, precio y estado", () => {
    render(
      <ProductsTable
        products={mockProducts}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        canManage={true}
      />
    );

    expect(screen.getByText("CON-001")).toBeInTheDocument();
    expect(screen.getByText("Contenedor 16oz")).toBeInTheDocument();
    expect(screen.getByText("$15.50")).toBeInTheDocument();
    expect(screen.getByText("50 paquete")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();

    expect(screen.getByText("VAS-002")).toBeInTheDocument();
    expect(screen.getByText("0 paquete")).toBeInTheDocument();
    expect(screen.getByText("Baja")).toBeInTheDocument();
  });

  it("debe invocar onEdit al hacer clic en Editar", () => {
    const handleEdit = vi.fn();
    render(
      <ProductsTable
        products={mockProducts}
        isLoading={false}
        onEdit={handleEdit}
        onDelete={vi.fn()}
        canManage={true}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    fireEvent.click(editButtons[0]);

    expect(handleEdit).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("no debe mostrar acciones de edición si canManage es false", () => {
    render(
      <ProductsTable
        products={mockProducts}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        canManage={false}
      />
    );

    expect(screen.queryByRole("button", { name: /Editar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Baja/i })).toBeNull();
  });
});
