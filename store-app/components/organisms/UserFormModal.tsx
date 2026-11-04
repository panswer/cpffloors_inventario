"use client";

import React, { useState, useEffect } from "react";
import { FormField, SelectField } from "../molecules";
import { Button } from "../atoms";
import { UserItem, CreateUserInput, UpdateUserInput } from "@/services/userService";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  userToEdit?: UserItem | null;
  isLoading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
  isLoading = false,
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "user">("user");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setName(userToEdit.name || "");
      setRole(userToEdit.role);
      setIsActive(userToEdit.isActive);
      setPassword("");
    } else {
      setUsername("");
      setName("");
      setRole("user");
      setPassword("");
      setIsActive(true);
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userToEdit) {
      // Crear
      if (!username.trim() || !password) {
        setError("Usuario y contraseña requeridos.");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener mínimo 6 caracteres.");
        return;
      }
      try {
        await onSubmit({ username, name, role, password });
        onClose();
      } catch (err: any) {
        setError(err.message || "Error al crear usuario");
      }
    } else {
      // Editar
      const payload: UpdateUserInput = { name, role, isActive };
      if (password.trim()) {
        if (password.length < 6) {
          setError("La nueva contraseña debe tener mínimo 6 caracteres.");
          return;
        }
        payload.password = password;
      }
      try {
        await onSubmit(payload);
        onClose();
      } catch (err: any) {
        setError(err.message || "Error al actualizar usuario");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField
            id="modal-username"
            label="Nombre de Usuario"
            required
            disabled={!!userToEdit}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ej. jperez"
          />

          <FormField
            id="modal-name"
            label="Nombre Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Juan Pérez"
          />

          <SelectField
            id="modal-role"
            label="Rol de Usuario"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            options={[
              { label: "Usuario Estándar", value: "user" },
              { label: "Gerente / Supervisor", value: "manager" },
              { label: "Administrador", value: "admin" },
            ]}
          />

          <FormField
            id="modal-password"
            label={userToEdit ? "Contraseña (dejar en blanco para conservar)" : "Contraseña"}
            type="password"
            required={!userToEdit}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {userToEdit && (
            <div className="flex items-center gap-2 pt-2">
              <input
                id="modal-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="modal-active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Usuario Activo
              </label>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {userToEdit ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
