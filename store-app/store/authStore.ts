import { create } from "zustand";

export interface UserSession {
  id: string;
  username: string;
  name?: string;
  role: "admin" | "user" | "manager";
  mustChangePassword?: boolean;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  setUser: (user: UserSession | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
}));
