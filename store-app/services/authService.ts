export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    username: string;
    name?: string;
    role: "admin" | "user" | "manager";
    mustChangePassword?: boolean;
  };
}

export const authApi = {
  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    return data;
  },

  // Obtener usuario autenticado actual
  async getMe(): Promise<{ user: AuthResponse["user"] }> {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "No autenticado");
    }

    return data;
  },

  // Cerrar sesión
  async logout(): Promise<void> {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Error al cerrar sesión");
    }
  },

  // Cambiar contraseña (primer inicio de sesión o actualización obligatoria)
  async changePassword(input: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<{ message: string; user: AuthResponse["user"] }> {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Error al cambiar la contraseña");
    }

    return data;
  },
};
