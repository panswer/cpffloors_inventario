export interface UserItem {
  _id: string;
  username: string;
  name?: string;
  role: "admin" | "manager" | "user";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  name?: string;
  role: "admin" | "manager" | "user";
}

export interface UpdateUserInput {
  name?: string;
  role?: "admin" | "manager" | "user";
  password?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean | string;
}

export const usersApi = {
  // Listar usuarios
  async getUsers(filters?: UserFilters): Promise<{ users: UserItem[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined && filters?.isActive !== "") {
      params.append("isActive", String(filters.isActive));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/users${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al listar usuarios");
    return data;
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<{ user: UserItem }> {
    const res = await fetch(`/api/users/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al obtener usuario");
    return data;
  },

  // Crear usuario
  async createUser(input: CreateUserInput): Promise<{ message: string; user: UserItem }> {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al crear usuario");
    return data;
  },

  // Actualizar usuario
  async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<{ message: string; user: UserItem }> {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");
    return data;
  },

  // Dar de baja (Soft Delete)
  async deleteUser(id: string): Promise<{ message: string; userId: string }> {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al dar de baja al usuario");
    return data;
  },
};
