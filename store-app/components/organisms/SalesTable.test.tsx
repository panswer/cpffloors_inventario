import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SalesTable } from "./SalesTable";
import { SaleRecord } from "@/services/saleService";

describe("<SalesTable /> Organism", () => {
  const mockSales: SaleRecord[] = [
    {
      _id: "sale-1",
      saleNumber: "VNT-202611-0001",
      clientId: "client-1",
      recipientName: "Restaurante Central",
      deliveryAddress: "Av. Principal 123",
      items: [],
      subtotal: 100,
      tax: 0,
      total: 100,
      paymentMethod: "efectivo",
      status: "completada",
      userId: "user-1",
      createdAt: new Date("2026-11-01T10:00:00Z").toISOString(),
      updatedAt: new Date("2026-11-01T10:00:00Z").toISOString(),
    },
    {
      _id: "sale-2",
      saleNumber: "VNT-202611-0002",
      clientId: "client-2",
      recipientName: "Café Express",
      deliveryAddress: "Calle 5",
      items: [],
      subtotal: 45,
      tax: 0,
      total: 45,
      paymentMethod: "tarjeta",
      status: "anulada",
      userId: "user-1",
      createdAt: new Date("2026-11-02T10:00:00Z").toISOString(),
      updatedAt: new Date("2026-11-02T10:00:00Z").toISOString(),
    },
  ];

  it("debe renderizar el número de venta, destinatario, método de pago y estado", () => {
    render(
      <SalesTable
        sales={mockSales}
        isLoading={false}
        onViewDetails={vi.fn()}
        onCancelSale={vi.fn()}
        canCancel={true}
      />
    );

    expect(screen.getByText("VNT-202611-0001")).toBeInTheDocument();
    expect(screen.getByText("Restaurante Central")).toBeInTheDocument();
    expect(screen.getByText("efectivo")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();

    expect(screen.getByText("VNT-202611-0002")).toBeInTheDocument();
    expect(screen.getByText("Anulada")).toBeInTheDocument();
  });

  it("debe invocar onViewDetails al presionar el botón 'Detalle'", () => {
    const handleView = vi.fn();
    render(
      <SalesTable
        sales={mockSales}
        isLoading={false}
        onViewDetails={handleView}
        onCancelSale={vi.fn()}
        canCancel={true}
      />
    );

    const detailButtons = screen.getAllByRole("button", { name: /Detalle/i });
    fireEvent.click(detailButtons[0]);

    expect(handleView).toHaveBeenCalledWith(mockSales[0]);
  });

  it("solo debe mostrar botón 'Anular' para ventas completadas y si canCancel es true", () => {
    const handleCancel = vi.fn();
    render(
      <SalesTable
        sales={mockSales}
        isLoading={false}
        onViewDetails={vi.fn()}
        onCancelSale={handleCancel}
        canCancel={true}
      />
    );

    // Solo sale-1 está completada, sale-2 está anulada
    const cancelButtons = screen.getAllByRole("button", { name: /Anular/i });
    expect(cancelButtons).toHaveLength(1);

    fireEvent.click(cancelButtons[0]);
    expect(handleCancel).toHaveBeenCalledWith(mockSales[0]);
  });
});
