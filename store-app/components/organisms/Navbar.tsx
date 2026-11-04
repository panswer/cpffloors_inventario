import React from "react";
import { Button } from "../atoms";

interface NavbarProps {
  user?: {
    name?: string;
    username: string;
    role: string;
  } | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  isLoggingOut,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
            CPF
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            CPF Floors
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user?.name || user?.username || "Usuario"}
            </p>
            <p className="text-xs text-zinc-500 capitalize dark:text-zinc-400">
              {user?.role || "user"}
            </p>
          </div>

          <Button
            variant="outline"
            isLoading={isLoggingOut}
            onClick={onLogout}
            className="!py-1.5 !px-3 text-xs"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
};
