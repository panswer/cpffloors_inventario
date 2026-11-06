"use client";

import React, { useState } from "react";
import { FormField } from "../molecules";
import { Button, Badge } from "../atoms";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id?: string;
    name?: string;
    username: string;
    role: string;
  } | null;
  onChangePassword: (data: { currentPassword?: string; newPassword: string }) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onChangePassword,
  isLoading = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "admin":
        return "info";
      case "manager":
        return "warning";
      default:
        return "default";
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setError("Debes ingresar tu contraseña actual.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("La confirmación de la contraseña no coincide.");
      return;
    }

    try {
      await onChangePassword({ currentPassword, newPassword });
      setSuccessMessage("¡Contraseña actualizada exitosamente!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-bold">
              👤
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Mi Perfil
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Detalles de tu cuenta de sesión
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Información del Perfil */}
        <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-zinc-400">Usuario</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.username}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400">Nombre</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.name || "Sin especificar"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400">Rol Asignado</span>
              <div className="mt-0.5">
                <Badge variant={getRoleBadgeVariant(user?.role)}>{user?.role || "user"}</Badge>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400">Estado</span>
              <div className="mt-0.5">
                <Badge variant="success">Sesión Activa</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Cambio de Contraseña */}
        <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            🔑 Cambiar Contraseña
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ingresa tu contraseña actual y define tu nueva contraseña.
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            <FormField
              id="profile-current-password"
              label="Contraseña Actual"
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                id="profile-new-password"
                label="Nueva Contraseña"
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <FormField
                id="profile-confirm-password"
                label="Confirmar Nueva Contraseña"
                type="password"
                required
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-5 flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" type="button" onClick={onClose}>
                Cerrar
              </Button>
              <Button variant="primary" type="submit" isLoading={isLoading}>
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
