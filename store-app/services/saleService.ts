export interface SaleItemData {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
}

export interface SaleRecord {
  _id: string;
  saleNumber: string;
  clientId: string;
  recipientName: string;
  deliveryAddress: string;
  items: SaleItemData[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "efectivo" | "tarjeta" | "transferencia" | "credito";
  status: "completada" | "anulada";
  userId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MinimalClientInput {
  documentId: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface CreateSaleInput {
  clientId?: string;
  newClient?: MinimalClientInput;
  recipientName?: string;
  deliveryAddress?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod?: "efectivo" | "tarjeta" | "transferencia" | "credito";
  taxRate?: number;
  notes?: string;
}

export interface SaleFilters {
  search?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SaleReportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
}

export interface SaleReportSummary {
  totalSales: number;
  completedSales: number;
  cancelledSales: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface PaymentMethodMetric {
  paymentMethod: string;
  count: number;
  total: number;
}

export interface TopProductMetric {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SaleReportResponse {
  summary: SaleReportSummary;
  byPaymentMethod: PaymentMethodMetric[];
  topProducts: TopProductMetric[];
  sales: (SaleRecord & {
    clientId?: { _id: string; name: string; documentId: string; phone?: string };
    userId?: { _id: string; name: string; username: string };
  })[];
}

export const salesApi = {
  // Listar ventas
  async getSales(filters?: SaleFilters): Promise<{
    sales: SaleRecord[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/sales${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al listar ventas");
    return data;
  },

  // Obtener detalle de venta por ID
  async getSaleById(id: string): Promise<{ sale: SaleRecord }> {
    const res = await fetch(`/api/sales/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al consultar venta");
    return data;
  },

  // Registrar venta
  async createSale(input: CreateSaleInput): Promise<{ message: string; sale: SaleRecord }> {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al procesar la venta");
    return data;
  },

  // Anular venta (reponiendo stock)
  async cancelSale(id: string, notes?: string): Promise<{ message: string; sale: SaleRecord }> {
    const res = await fetch(`/api/sales/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "anular", notes }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al anular la venta");
    return data;
  },

  // Obtener reporte analítico de ventas
  async getSalesReport(filters?: SaleReportFilter): Promise<SaleReportResponse> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/sales/reports${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al generar el reporte");
    return data;
  },
};
