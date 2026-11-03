"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/atoms";

export default function Home() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ¡Bienvenido{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sistema de Inventario - CPF Floors
        </p>

        <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Usuario:</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {user?.username || "Cargando..."}
            </span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Rol:</span>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {user?.role || "user"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            isLoading={isLoggingOut}
            onClick={() => logout()}
            className="w-full"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
