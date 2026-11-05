"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { reportClientError } from "@/lib/clientLogger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Reportar el crash al backend
    reportClientError({
      message: error.message || "Error desconocido en componente React",
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      source: "error-boundary",
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl text-center dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-4">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Algo no salió como esperábamos
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Ha ocurrido un error inesperado en la interfaz. El equipo técnico ha sido notificado automáticamente de este incidente.
            </p>

            {this.state.error && process.env.NODE_ENV === "development" && (
              <div className="mb-6 max-h-32 overflow-y-auto rounded-lg bg-zinc-100 p-3 text-left font-mono text-xs text-red-600 dark:bg-zinc-800 dark:text-red-400">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
            >
              Recargar la página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
