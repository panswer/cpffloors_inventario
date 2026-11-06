import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DashboardCard } from "./DashboardCard";

describe("<DashboardCard /> Molecule", () => {
  it("debe renderizar título, descripción, icono y badge", () => {
    render(
      <DashboardCard
        title="Productos"
        description="Gestión de inventario y stock"
        href="/products"
        badge="Inventario"
        icon={<span data-testid="card-icon">📦</span>}
      />
    );

    expect(screen.getByText("Productos")).toBeInTheDocument();
    expect(screen.getByText("Gestión de inventario y stock")).toBeInTheDocument();
    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByTestId("card-icon")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products");
  });

  it("no debe mostrar badge si no se proporciona", () => {
    render(
      <DashboardCard
        title="Ventas"
        description="Módulo comercial"
        href="/sales"
        icon={<span>💰</span>}
      />
    );

    expect(screen.queryByText("Inventario")).toBeNull();
  });
});
