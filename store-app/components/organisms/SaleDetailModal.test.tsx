import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SaleDetailModal } from "./SaleDetailModal";
import { SaleRecord } from "@/services/saleService";

// Mock del hook useSaleDetail
vi.mock("@/hooks/useSales", () => ({
  useSaleDetail: vi.fn(),
}));

import { useSaleDetail } from "@/hooks/useSales";

describe("<SaleDetailModal /> Organism", () => {
  const mockInitialSale: SaleRecord = {
    _id: "sale-123",
    saleNumber: "VNT-202611-9999",
    clientId: "client-1",
    recipientName: "Almacén Central",
    deliveryAddress: "Zona Industrial Lote 4",
    items: [
      {
        productId: "prod-1",
        sku: "CON-001",
        name: "Contenedor 16oz",
        quantity: 10,
        unitPrice: 5.0,
        unit: "paquete",
        subtotal: 50.0,
      },
    ],
    subtotal: 50.0,
    tax: 0,
    total: 50.0,
    paymentMethod: "transferencia",
    status: "completada",
    userId: "user-1",
    createdAt: new Date("2026-11-01T12:00:00Z").toISOString(),
    updatedAt: new Date("2026-11-01T12:00:00Z").toISOString(),
  };

  it("no debe renderizar nada si saleId es null", () => {
    (useSaleDetail as any).mockReturnValue({ data: null, isLoading: false, error: null });

    const { container } = render(
      <SaleDetailModal saleId={null} onClose={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("debe mostrar número de venta, destinatario, dirección, productos y total", () => {
    (useSaleDetail as any).mockReturnValue({
      data: { sale: mockInitialSale },
      isLoading: false,
      error: null,
    });

    render(
      <SaleDetailModal
        saleId="sale-123"
        initialSale={mockInitialSale}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("VNT-202611-9999")).toBeInTheDocument();
    expect(screen.getByText("Almacén Central")).toBeInTheDocument();
    expect(screen.getByText("Zona Industrial Lote 4")).toBeInTheDocument();
    expect(screen.getByText("Contenedor 16oz")).toBeInTheDocument();
    expect(screen.getByText("CON-001")).toBeInTheDocument();
    expect(screen.getByText("10 paquete")).toBeInTheDocument();

    // Comprobar tanto el subtotal de la fila como el Total Pagado
    const prices = screen.getAllByText("$50.00");
    expect(prices).toHaveLength(2); // 1 en la fila de producto (subtotal) y 1 en Total Pagado
    expect(screen.getByText("Total Pagado")).toBeInTheDocument();
  });

  it("debe invocar onClose al hacer clic en el botón Cerrar o en ✕", () => {
    (useSaleDetail as any).mockReturnValue({
      data: { sale: mockInitialSale },
      isLoading: false,
      error: null,
    });

    const handleClose = vi.fn();
    render(
      <SaleDetailModal
        saleId="sale-123"
        initialSale={mockInitialSale}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: "Cerrar" });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
