import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Table, Column } from "./Table";

interface SampleItem {
  id: string;
  name: string;
  stock: number;
}

describe("<Table /> Molecule", () => {
  const columns: Column<SampleItem>[] = [
    { header: "Nombre", accessorKey: "name" },
    {
      header: "Stock",
      accessorKey: "stock",
      render: (item) => `${item.stock} unidades`,
    },
  ];

  const data: SampleItem[] = [
    { id: "1", name: "Contenedor 16oz", stock: 150 },
    { id: "2", name: "Vaso 12oz", stock: 200 },
  ];

  it("debe renderizar los encabezados y las filas con sus datos", () => {
    render(
      <Table
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Contenedor 16oz")).toBeInTheDocument();
    expect(screen.getByText("150 unidades")).toBeInTheDocument();
    expect(screen.getByText("Vaso 12oz")).toBeInTheDocument();
    expect(screen.getByText("200 unidades")).toBeInTheDocument();
  });

  it("debe mostrar el mensaje de carga cuando isLoading es true", () => {
    render(
      <Table
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading
        loadingMessage="Obteniendo productos..."
      />
    );

    expect(screen.getByText("Obteniendo productos...")).toBeInTheDocument();
  });

  it("debe mostrar el mensaje vacío cuando no hay registros", () => {
    render(
      <Table
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Inventario vacío"
      />
    );

    expect(screen.getByText("Inventario vacío")).toBeInTheDocument();
  });
});
