import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CancelSaleModal } from "./CancelSaleModal";
import { SaleRecord } from "@/services/saleService";

describe("<CancelSaleModal /> Organism", () => {
  const mockSale: SaleRecord = {
    _id: "sale-999",
    saleNumber: "VNT-202611-9999",
    clientId: "client-1",
    recipientName: "Supermercado El Sol",
    deliveryAddress: "Av. Central 123",
    items: [],
    subtotal: 150,
    tax: 0,
    total: 150,
    paymentMethod: "efectivo",
    status: "completada",
    userId: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("no debe renderizar nada si isOpen es false o sale es null", () => {
    const { container: c1 } = render(
      <CancelSaleModal
        isOpen={false}
        sale={mockSale}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <CancelSaleModal
        isOpen={true}
        sale={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(c2.firstChild).toBeNull();
  });

  it("debe mostrar el número de pedido, advertencia de stock, destinatario y total", () => {
    render(
      <CancelSaleModal
        isOpen={true}
        sale={mockSale}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Anular Venta / Pedido")).toBeInTheDocument();
    expect(screen.getByText("VNT-202611-9999")).toBeInTheDocument();
    expect(screen.getByText("Supermercado El Sol")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(
      screen.getByText(/el stock de todos los productos será devuelto/i)
    ).toBeInTheDocument();
  });

  it("debe capturar el motivo opcional y enviar al confirmar", async () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <CancelSaleModal
        isOpen={true}
        sale={mockSale}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText(/pedido duplicado/i);
    fireEvent.change(textarea, {
      target: { value: "Cliente solicitó cancelar por retraso de entrega" },
    });

    const form = screen.getByRole("button", { name: /Confirmar Anulación/i }).closest("form");
    fireEvent.submit(form!);

    expect(handleConfirm).toHaveBeenCalledWith(
      "sale-999",
      "Cliente solicitó cancelar por retraso de entrega"
    );
  });

  it("debe permitir cerrar el modal sin confirmar", () => {
    const handleClose = vi.fn();
    render(
      <CancelSaleModal
        isOpen={true}
        sale={mockSale}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
