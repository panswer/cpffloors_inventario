export interface ClientItem {
  _id: string;
  documentId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  documentId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientInput {
  documentId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ClientFilters {
  search?: string;
  isActive?: boolean | string;
}

export const clientsApi = {
  // Listar clientes
  async getClients(filters?: ClientFilters): Promise<{ clients: ClientItem[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isActive !== undefined && filters?.isActive !== "") {
      params.append("isActive", String(filters.isActive));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/clients${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al listar clientes");
    return data;
  },

  // Obtener cliente por ID
  async getClientById(id: string): Promise<{ client: ClientItem }> {
    const res = await fetch(`/api/clients/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al obtener cliente");
    return data;
  },

  // Crear cliente
  async createClient(input: CreateClientInput): Promise<{ message: string; client: ClientItem }> {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al crear cliente");
    return data;
  },

  // Actualizar cliente
  async updateClient(
    id: string,
    input: UpdateClientInput
  ): Promise<{ message: string; client: ClientItem }> {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al actualizar cliente");
    return data;
  },

  // Dar de baja cliente (Soft delete)
  async deleteClient(id: string): Promise<{ message: string; clientId: string }> {
    const res = await fetch(`/api/clients/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al dar de baja el cliente");
    return data;
  },
};
