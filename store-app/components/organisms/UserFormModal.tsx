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
  currentUserId?: string;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
  isLoading = false,
  currentUserRole = "user",
  currentUserId,
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "user">("user");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [unlockAccount, setUnlockAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUserRole === "admin";
  const isManager = currentUserRole === "manager";
  const isCurrentlyLocked = Boolean(userToEdit?.lockUntil && new Date(userToEdit.lockUntil) > new Date());
  // Solo se puede editar la clave si es un nuevo usuario o si el usuario editado es la misma persona autenticada
  const isEditingSelf = Boolean(userToEdit && currentUserId && userToEdit._id === currentUserId);
  const canEditPassword = !userToEdit || isEditingSelf;

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setName(userToEdit.name || "");
      setRole(userToEdit.role);
      setIsActive(userToEdit.isActive);
      setPassword("");
      setUnlockAccount(false);
    } else {
      setUsername("");
      setName("");
      // Si es manager, por defecto es "user"; si es admin, inicia en "user"
      setRole("user");
      // Generar contraseña aleatoria por defecto para nuevos usuarios
      setPassword(generateRandomPassword());
      setIsActive(true);
      setUnlockAccount(false);
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
      if (unlockAccount) {
        payload.unlockAccount = true;
      }
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

          {canEditPassword ? (
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="modal-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {userToEdit ? "Nueva Contraseña (dejar en blanco para conservar)" : "Contraseña Temporal"}
                </label>
                {!userToEdit && (
                  <button
                    type="button"
                    onClick={() => setPassword(generateRandomPassword())}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    🎲 Generar otra clave
                  </button>
                )}
              </div>
              <div className="mt-1">
                <input
                  id="modal-password"
                  type={userToEdit ? "password" : "text"}
                  required={!userToEdit}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              {!userToEdit && (
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Esta es la clave temporal para el usuario. En su primer inicio de sesión, el sistema le solicitará cambiarla obligatoriamente.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              🔒 Por seguridad, solo el propio usuario puede modificar su contraseña desde su perfil o en su inicio de sesión.
            </div>
          )}

          {userToEdit && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
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

              {isCurrentlyLocked && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <input
                    id="modal-unlock"
                    type="checkbox"
                    checked={unlockAccount}
                    onChange={(e) => setUnlockAccount(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="modal-unlock" className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Desbloquear cuenta (restablecer intentos de inicio de sesión)
                  </label>
                </div>
              )}
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
