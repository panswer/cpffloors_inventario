"use client";

import React, { useState, useEffect } from "react";
import { FormField, SelectField } from "../molecules";
import { Button } from "../atoms";
import { UserItem, UpdateUserInput } from "@/services/userService";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  userToEdit?: UserItem | null;
  isLoading?: boolean;
  currentUserRole?: string;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
  isLoading = false,
  currentUserRole = "user",
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "user">("user");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUserRole === "admin";
  const isManager = currentUserRole === "manager";

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
      // Si es manager, por defecto es "user"; si es admin, inicia en "user"
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

    // Validación si un manager intenta editar a alguien que no sea "user"
    if (isManager && userToEdit && userToEdit.role !== "user") {
      setError("Solo tienes permisos para gestionar usuarios con rol 'user'.");
      return;
    }

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

      // Si es manager, su rol siempre es forzado a "user"
      const roleToCreate = isAdmin ? role : "user";

      try {
        await onSubmit({ username, name, role: roleToCreate, password });
        onClose();
      } catch (err: any) {
        setError(err.message || "Error al crear usuario");
      }
    } else {
      // Editar
      const payload: UpdateUserInput = { name, isActive };
      // Solo el admin puede modificar roles
      if (isAdmin) {
        payload.role = role;
      } else {
        payload.role = "user";
      }

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

          {/* Opciones de rol según permisos */}
          {isAdmin ? (
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
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Rol Asignado
              </label>
              <div className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Usuario Estándar (user)
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Como gerente, los usuarios que crees o edites tienen rol &quot;user&quot;.
              </p>
            </div>
          )}

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
