"use client";

import React, { useState } from "react";
import { FormField } from "../molecules";
import { Button } from "../atoms";

interface ChangePasswordModalProps {
  isOpen: boolean;
  username: string;
  onSubmit: (newPassword: string) => Promise<void>;
  isLoading?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  username,
  onSubmit,
  isLoading = false,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    try {
      await onSubmit(newPassword);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            🔐
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Primer Inicio de Sesión
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Bienvenido, <span className="font-semibold">{username}</span>. Por seguridad debes establecer una nueva contraseña.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField
            id="first-new-password"
            label="Nueva Contraseña"
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <FormField
            id="first-confirm-password"
            label="Confirmar Nueva Contraseña"
            type="password"
            required
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Guardar Contraseña e Ingresar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
